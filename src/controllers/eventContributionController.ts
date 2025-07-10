import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer une nouvelle contribution d'événement
export const createEventContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      eventId,
      userId,
      amount,
      paymentDate,
      paymentMethod,
      transactionReference,
      notes,
    } = req.body;

    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    // Vérifier si l'événement existe
    const eventExists = await prisma.event.findUnique({
      where: { id: BigInt(eventId) },
    });
    if (!eventExists) {
      return res.status(404).json({ message: "Événement introuvable." });
    }

    // Vérifier si l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!userExists) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Permissions : Un utilisateur peut créer sa propre contribution pour un événement. Un admin peut créer pour n'importe qui.
    if (!isAdmin && BigInt(userId) !== currentUserId) {
      return res
        .status(403)
        .json({
          message:
            "Non autorisé à créer une contribution pour un autre utilisateur.",
        });
    }

    // Optional: Check for duplicate contribution for the same user and event
    const existingContribution = await prisma.eventContribution.findFirst({
      where: {
        eventId: BigInt(eventId),
        userId: BigInt(userId),
        // Potentially add a date range or amount check if strict duplicates are to be prevented
      },
    });

    if (existingContribution) {
      // This is a simple check, you might want more complex logic if multiple contributions per event are allowed
      // but identical ones should be prevented.
      // For now, allow multiple, but you could return 409 here if it was meant to be unique per user/event.
    }

    const newContribution = await prisma.eventContribution.create({
      data: {
        event: { connect: { id: BigInt(eventId) } },
        user: { connect: { id: BigInt(userId) } },
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod,
        transactionReference,
        notes,
      },
    });

    res.status(201).json({
      message: "Contribution d'événement créée avec succès.",
      eventContribution: serializeBigInt(newContribution),
    });
  }
);

// Obtenir toutes les contributions d'événements (avec filtres)
export const getAllEventContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const isAdmin = req.isAdmin as boolean;
    const currentUserId = req.userId as bigint;

    const { eventId, userId } = req.query;

    const whereClause: any = {};

    // Si l'utilisateur n'est pas admin, il ne peut voir que les contributions le concernant
    if (!isAdmin) {
      whereClause.OR = [
        { userId: currentUserId },
        // Optionally, allow users to see contributions for public events they are not involved in
        // requires joining with Event model and checking isPrivate
        // For now, strict: only contributions where they are the userId
      ];
    } else {
      // Admin can filter
      if (eventId) whereClause.eventId = BigInt(eventId as string);
      if (userId) whereClause.userId = BigInt(userId as string);
    }

    const eventContributions = await prisma.eventContribution.findMany({
      where: whereClause,
      include: {
        event: { select: { id: true, title: true, startDate: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    res.status(200).json(serializeBigInt(eventContributions));
  }
);

// Obtenir une contribution d'événement par son ID
export const getEventContributionById = asyncHandler(
  async (req: Request, res: Response) => {
    const contributionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const contribution = await prisma.eventContribution.findUnique({
      where: { id: contributionId },
      include: {
        event: { select: { id: true, title: true, startDate: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!contribution) {
      return res
        .status(404)
        .json({ message: "Contribution d'événement introuvable." });
    }

    // Permissions : Seul l'admin ou l'utilisateur concerné peut voir la contribution
    if (!isAdmin && contribution.userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à cette contribution." });
    }

    res.status(200).json(serializeBigInt(contribution));
  }
);

// Mettre à jour une contribution d'événement
export const updateEventContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contributionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingContribution = await prisma.eventContribution.findUnique({
      where: { id: contributionId },
    });

    if (!existingContribution) {
      return res
        .status(404)
        .json({ message: "Contribution d'événement introuvable." });
    }

    // Permissions : Seul l'admin ou l'utilisateur concerné peut mettre à jour sa contribution
    if (!isAdmin && existingContribution.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message:
            "Accès non autorisé à la modification de cette contribution.",
        });
    }

    const {
      eventId, // Changing eventId is generally not allowed or handled separately for contributions
      userId, // Changing userId is generally not allowed for existing contributions
      amount,
      paymentDate,
      paymentMethod,
      transactionReference,
      notes,
    } = req.body;

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (paymentDate !== undefined)
      updateData.paymentDate = new Date(paymentDate);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (transactionReference !== undefined)
      updateData.transactionReference = transactionReference;
    if (notes !== undefined) updateData.notes = notes;

    // If eventId or userId are provided in update, you might want to handle it (e.g., re-connect or error)
    // For now, these are generally not expected to change for an existing contribution.
    // If you allow changing eventId, you'd need to validate if the new event exists.
    // Example: if (eventId !== undefined) { const newEvent = await prisma.event.findUnique({ where: { id: BigInt(eventId) } }); if (!newEvent) { /* error */ } updateData.event = { connect: { id: BigInt(eventId) } }; }

    const updatedContribution = await prisma.eventContribution.update({
      where: { id: contributionId },
      data: updateData,
    });

    res.status(200).json({
      message: "Contribution d'événement mise à jour avec succès.",
      eventContribution: serializeBigInt(updatedContribution),
    });
  }
);

// Supprimer une contribution d'événement
export const deleteEventContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const contributionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingContribution = await prisma.eventContribution.findUnique({
      where: { id: contributionId },
    });

    if (!existingContribution) {
      return res
        .status(404)
        .json({ message: "Contribution d'événement introuvable." });
    }

    // Permissions : Seul l'admin ou l'utilisateur concerné peut supprimer sa contribution
    if (!isAdmin && existingContribution.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Accès non autorisé à la suppression de cette contribution.",
        });
    }

    await prisma.eventContribution.delete({
      where: { id: contributionId },
    });

    res
      .status(200)
      .json({ message: "Contribution d'événement supprimée avec succès." });
  }
);
