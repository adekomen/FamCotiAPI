import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer une nouvelle réunion familiale (Admin seulement)
export const createFamilyMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      meetingDate,
      location,
      startTime,
      endTime,
      createdById,
    } = req.body;

    const currentAdminId = req.userId as bigint;
    // createdById doit correspondre à l'admin connecté ou être validé comme admin
    if (BigInt(createdById) !== currentAdminId) {
      const creatorUser = await prisma.user.findUnique({
        where: { id: BigInt(createdById) },
      });
      if (!creatorUser || !creatorUser.isAdmin) {
        return res
          .status(403)
          .json({
            message:
              "Seul un administrateur peut créer des réunions, et createdById doit être un ID d'administrateur valide.",
          });
      }
    }

    const newMeeting = await prisma.familyMeeting.create({
      data: {
        title,
        description,
        meetingDate: new Date(meetingDate),
        location,
        startTime,
        endTime,
        createdBy: { connect: { id: BigInt(createdById) } },
      },
    });

    res.status(201).json({
      message: "Réunion familiale créée avec succès.",
      familyMeeting: serializeBigInt(newMeeting),
    });
  }
);

// Obtenir toutes les réunions familiales (Accessible à tous les utilisateurs authentifiés)
export const getAllFamilyMeetings = asyncHandler(
  async (req: Request, res: Response) => {
    const { fromDate, toDate } = req.query;

    const whereClause: any = {};
    if (fromDate) {
      whereClause.meetingDate = {
        ...whereClause.meetingDate,
        gte: new Date(fromDate as string),
      };
    }
    if (toDate) {
      whereClause.meetingDate = {
        ...whereClause.meetingDate,
        lte: new Date(toDate as string),
      };
    }

    const meetings = await prisma.familyMeeting.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: {
          select: { meetingAttendances: true },
        },
      },
      orderBy: { meetingDate: "desc" },
    });

    res.status(200).json(serializeBigInt(meetings));
  }
);

// Obtenir une réunion familiale par son ID (Accessible à tous les utilisateurs authentifiés)
export const getFamilyMeetingById = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = BigInt(req.params.id);

    const meeting = await prisma.familyMeeting.findUnique({
      where: { id: meetingId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        meetingAttendances: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Réunion familiale introuvable." });
    }

    res.status(200).json(serializeBigInt(meeting));
  }
);

// Mettre à jour une réunion familiale (Admin seulement)
export const updateFamilyMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meetingId = BigInt(req.params.id);
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier les réunions familiales." });
    }

    const existingMeeting = await prisma.familyMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!existingMeeting) {
      return res
        .status(404)
        .json({ message: "Réunion familiale introuvable." });
    }

    const { title, description, meetingDate, location, startTime, endTime } =
      req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (meetingDate !== undefined)
      updateData.meetingDate = new Date(meetingDate);
    if (location !== undefined) updateData.location = location;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;

    const updatedMeeting = await prisma.familyMeeting.update({
      where: { id: meetingId },
      data: updateData,
    });

    res.status(200).json({
      message: "Réunion familiale mise à jour avec succès.",
      familyMeeting: serializeBigInt(updatedMeeting),
    });
  }
);

// Supprimer une réunion familiale (Admin seulement)
export const deleteFamilyMeeting = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = BigInt(req.params.id);
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer les réunions familiales." });
    }

    const existingMeeting = await prisma.familyMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!existingMeeting) {
      return res
        .status(404)
        .json({ message: "Réunion familiale introuvable." });
    }

    await prisma.familyMeeting.delete({
      where: { id: meetingId },
    });

    res
      .status(200)
      .json({ message: "Réunion familiale supprimée avec succès." });
  }
);
