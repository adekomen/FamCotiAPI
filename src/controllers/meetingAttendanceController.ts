import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Enregistrer la présence à une réunion (Admin ou l'utilisateur lui-même)
export const createMeetingAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { meetingId, userId, attendanceStatus, excuseReason } = req.body;

    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    // Vérifier si la réunion existe
    const meetingExists = await prisma.familyMeeting.findUnique({
      where: { id: BigInt(meetingId) },
    });
    if (!meetingExists) {
      return res.status(404).json({ message: "Réunion introuvable." });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!userExists) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Permissions : Un utilisateur peut enregistrer sa propre présence/absence. Un admin peut enregistrer pour n'importe qui.
    if (!isAdmin && BigInt(userId) !== currentUserId) {
      return res
        .status(403)
        .json({
          message:
            "Non autorisé à enregistrer la présence pour un autre utilisateur.",
        });
    }

    // Vérifier si une entrée d'assiduité existe déjà pour cet utilisateur et cette réunion
    const existingAttendance = await prisma.meetingAttendance.findUnique({
      where: {
        userId_meetingId: {
          // Utilise la clé composée unique
          userId: BigInt(userId),
          meetingId: BigInt(meetingId),
        },
      },
    });

    if (existingAttendance) {
      return res
        .status(409)
        .json({
          message:
            "Cet utilisateur a déjà une entrée d'assiduité pour cette réunion. Veuillez la mettre à jour.",
        });
    }

    const newAttendance = await prisma.meetingAttendance.create({
      data: {
        meeting: { connect: { id: BigInt(meetingId) } },
        user: { connect: { id: BigInt(userId) } },
        attendanceStatus: attendanceStatus ?? "absent", // Default status
        excuseReason,
      },
    });

    res.status(201).json({
      message: "Assiduité à la réunion enregistrée avec succès.",
      meetingAttendance: serializeBigInt(newAttendance),
    });
  }
);

// Obtenir toutes les assiduités aux réunions (Admin peut tout voir, utilisateur non-admin voit les siennes)
export const getAllMeetingAttendances = asyncHandler(
  async (req: Request, res: Response) => {
    const isAdmin = req.isAdmin as boolean;
    const currentUserId = req.userId as bigint;

    const { meetingId, userId, status } = req.query;

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.userId = currentUserId; // Non-admin can only see their own attendance
    } else {
      // Admin can filter
      if (meetingId) whereClause.meetingId = BigInt(meetingId as string);
      if (userId) whereClause.userId = BigInt(userId as string);
      if (status) whereClause.attendanceStatus = status as string;
    }

    const attendances = await prisma.meetingAttendance.findMany({
      where: whereClause,
      include: {
        meeting: { select: { id: true, title: true, meetingDate: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(serializeBigInt(attendances));
  }
);

// Obtenir une assiduité spécifique par meetingId et userId (Admin ou l'utilisateur lui-même)
export const getMeetingAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = BigInt(req.params.meetingId);
    const userId = BigInt(req.params.userId);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const attendance = await prisma.meetingAttendance.findUnique({
      where: {
        userId_meetingId: {
          userId: userId,
          meetingId: meetingId,
        },
      },
      include: {
        meeting: { select: { id: true, title: true, meetingDate: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "Entrée d'assiduité introuvable." });
    }

    // Permissions : Admin peut voir n'importe quelle entrée. L'utilisateur concerné peut voir la sienne.
    if (!isAdmin && attendance.userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à cette entrée d'assiduité." });
    }

    res.status(200).json(serializeBigInt(attendance));
  }
);

// Mettre à jour une entrée d'assiduité (Admin ou l'utilisateur lui-même)
export const updateMeetingAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meetingId = BigInt(req.params.meetingId);
    const userId = BigInt(req.params.userId);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingAttendance = await prisma.meetingAttendance.findUnique({
      where: {
        userId_meetingId: {
          userId: userId,
          meetingId: meetingId,
        },
      },
    });

    if (!existingAttendance) {
      return res
        .status(404)
        .json({ message: "Entrée d'assiduité introuvable." });
    }

    // Permissions : Admin peut tout modifier. L'utilisateur peut modifier sa propre entrée.
    if (!isAdmin && existingAttendance.userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier cette entrée d'assiduité." });
    }

    const { attendanceStatus, excuseReason } = req.body;

    const updateData: any = {};
    if (attendanceStatus !== undefined)
      updateData.attendanceStatus = attendanceStatus;
    if (excuseReason !== undefined) updateData.excuseReason = excuseReason;

    const updatedAttendance = await prisma.meetingAttendance.update({
      where: {
        userId_meetingId: {
          userId: userId,
          meetingId: meetingId,
        },
      },
      data: updateData,
    });

    res.status(200).json({
      message: "Assiduité à la réunion mise à jour avec succès.",
      meetingAttendance: serializeBigInt(updatedAttendance),
    });
  }
);

// Supprimer une entrée d'assiduité (Admin seulement)
export const deleteMeetingAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = BigInt(req.params.meetingId);
    const userId = BigInt(req.params.userId);
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer les entrées d'assiduité." });
    }

    const existingAttendance = await prisma.meetingAttendance.findUnique({
      where: {
        userId_meetingId: {
          userId: userId,
          meetingId: meetingId,
        },
      },
    });

    if (!existingAttendance) {
      return res
        .status(404)
        .json({ message: "Entrée d'assiduité introuvable." });
    }

    await prisma.meetingAttendance.delete({
      where: {
        userId_meetingId: {
          userId: userId,
          meetingId: meetingId,
        },
      },
    });

    res
      .status(200)
      .json({ message: "Assiduité à la réunion supprimée avec succès." });
  }
);
