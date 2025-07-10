import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer un nouvel événement
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    // eventDate: SUPPRIMÉ car non présent dans le schéma Event
    location,
    eventTypeId,
    concernedUserId,
    isPrivate,
    isRecurring,
    recurrencePattern,
    startDate,
    endDate,
    isActive, // Ajouté car présent dans le schéma Event
    contributionRequired, // Ajouté car présent dans le schéma Event
  } = req.body;

  const currentUserId = req.userId as bigint;

  // Vérifier si le eventTypeId existe
  const eventTypeExists = await prisma.eventType.findUnique({
    where: { id: BigInt(eventTypeId) },
  });

  if (!eventTypeExists) {
    return res.status(404).json({ message: "Type d'événement introuvable." });
  }

  // Vérifier si concernedUserId existe si fourni
  if (concernedUserId) {
    const concernedUserExists = await prisma.user.findUnique({
      where: { id: BigInt(concernedUserId) },
    });
    if (!concernedUserExists) {
      return res
        .status(404)
        .json({ message: "Utilisateur concerné introuvable." });
    }
  }

  const newEvent = await prisma.event.create({
    data: {
      title,
      description,
      // eventDate: SUPPRIMÉ ici aussi
      startDate: new Date(startDate), // Convertir en objet Date
      endDate: endDate ? new Date(endDate) : null, // Convertir si présent, sinon null
      location,
      eventType: {
        // Relation many-to-one avec EventType
        connect: { id: BigInt(eventTypeId) },
      },
      createdBy: {
        // Relation many-to-one avec User (le créateur)
        connect: { id: currentUserId },
      },
      // Relation many-to-one optionnelle avec User (l'utilisateur concerné)
      concernedUser: concernedUserId
        ? { connect: { id: BigInt(concernedUserId) } }
        : undefined,
      isActive: isActive ?? true, // Utilisation de ?? pour default si non fourni dans le body
      contributionRequired: contributionRequired ?? true, // Utilisation de ?? pour default si non fourni dans le body
      isPrivate: isPrivate ?? false,
      isRecurring: isRecurring ?? false,
      recurrencePattern: recurrencePattern ?? null,
    },
  });

  res.status(201).json({
    message: "Événement créé avec succès.",
    event: serializeBigInt(newEvent),
  });
});

// Obtenir tous les événements
export const getAllEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    let events;
    if (isAdmin) {
      events = await prisma.event.findMany({
        include: {
          eventType: true,
          createdBy: { select: { id: true, name: true, email: true } },
          concernedUser: { select: { id: true, name: true, email: true } },
        },
      });
    } else {
      events = await prisma.event.findMany({
        where: {
          OR: [
            { isPrivate: false },
            { createdById: userId },
            { concernedUserId: userId },
          ],
        },
        include: {
          eventType: true,
          createdBy: { select: { id: true, name: true, email: true } },
          concernedUser: { select: { id: true, name: true, email: true } },
        },
      });
    }
    res.status(200).json(serializeBigInt(events));
  }
);

// Obtenir un événement par son ID
export const getEventById = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = BigInt(req.params.id);
    const userId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventType: true,
        createdBy: { select: { id: true, name: true, email: true } },
        concernedUser: { select: { id: true, name: true, email: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable." });
    }

    // Vérifier les permissions pour les événements privés
    if (
      event.isPrivate &&
      !isAdmin &&
      event.createdById !== userId &&
      event.concernedUserId !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à cet événement privé." });
    }

    res.status(200).json(serializeBigInt(event));
  }
);

// Mettre à jour un événement
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const eventId = BigInt(req.params.id);
  const userId = req.userId as bigint;
  const isAdmin = req.isAdmin as boolean;

  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent) {
    return res.status(404).json({ message: "Événement introuvable." });
  }

  // Seul l'administrateur ou le créateur de l'événement peut le modifier
  if (!isAdmin && existingEvent.createdById !== userId) {
    return res
      .status(403)
      .json({ message: "Accès non autorisé pour modifier cet événement." });
  }

  const {
    title,
    description,
    // eventDate: SUPPRIMÉ car non présent dans le schéma Event
    location,
    eventTypeId,
    concernedUserId,
    isPrivate,
    isRecurring,
    recurrencePattern,
    startDate,
    endDate,
    isActive,
    contributionRequired,
  } = req.body;

  // Construire l'objet de mise à jour dynamiquement
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  // eventDate: SUPPRIMÉ ici aussi
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (endDate !== undefined)
    updateData.endDate = endDate ? new Date(endDate) : null;
  if (location !== undefined) updateData.location = location;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (contributionRequired !== undefined)
    updateData.contributionRequired = contributionRequired;

  if (eventTypeId !== undefined) {
    const newEventType = await prisma.eventType.findUnique({
      where: { id: BigInt(eventTypeId) },
    });
    if (!newEventType) {
      return res
        .status(404)
        .json({ message: "Nouveau type d'événement introuvable." });
    }
    updateData.eventType = { connect: { id: BigInt(eventTypeId) } };
  }

  if (concernedUserId !== undefined) {
    if (concernedUserId === null) {
      updateData.concernedUser = { disconnect: true }; // Déconnecte la relation
    } else {
      const newConcernedUser = await prisma.user.findUnique({
        where: { id: BigInt(concernedUserId) },
      });
      if (!newConcernedUser) {
        return res
          .status(404)
          .json({ message: "Nouvel utilisateur concerné introuvable." });
      }
      updateData.concernedUser = { connect: { id: BigInt(concernedUserId) } };
    }
  }

  if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
  if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
  if (recurrencePattern !== undefined)
    updateData.recurrencePattern = recurrencePattern;

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
  });

  res.status(200).json({
    message: "Événement mis à jour avec succès.",
    event: serializeBigInt(updatedEvent),
  });
});

// Supprimer un événement
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const eventId = BigInt(req.params.id);
  const userId = req.userId as bigint;
  const isAdmin = req.isAdmin as boolean;

  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent) {
    return res.status(404).json({ message: "Événement introuvable." });
  }

  // Seul l'administrateur ou le créateur de l'événement peut le supprimer
  if (!isAdmin && existingEvent.createdById !== userId) {
    return res
      .status(403)
      .json({ message: "Accès non autorisé pour supprimer cet événement." });
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  res.status(200).json({ message: "Événement supprimé avec succès." });
});
