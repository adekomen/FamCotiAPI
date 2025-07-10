import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer un nouveau type d'événement (Admin seulement)
export const createEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isHappyEvent } = req.body;

    // Vérifier si un type d'événement avec le même nom existe déjà
    const existingEventType = await prisma.eventType.findFirst({
      where: { name: name },
    });

    if (existingEventType) {
      return res
        .status(409)
        .json({ message: "Un type d'événement avec ce nom existe déjà." });
    }

    const newEventType = await prisma.eventType.create({
      data: {
        name,
        description,
        isHappyEvent: isHappyEvent ?? true, // Défaut à true si non fourni
      },
    });

    res.status(201).json({
      message: "Type d'événement créé avec succès.",
      eventType: serializeBigInt(newEventType),
    });
  }
);

// Obtenir tous les types d'événements (Accessible à tous les utilisateurs authentifiés)
export const getAllEventTypes = asyncHandler(
  async (req: Request, res: Response) => {
    const eventTypes = await prisma.eventType.findMany();
    res.status(200).json(serializeBigInt(eventTypes));
  }
);

// Obtenir un type d'événement par son ID (Accessible à tous les utilisateurs authentifiés)
export const getEventTypeById = asyncHandler(
  async (req: Request, res: Response) => {
    const eventTypeId = BigInt(req.params.id);

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      return res.status(404).json({ message: "Type d'événement introuvable." });
    }

    res.status(200).json(serializeBigInt(eventType));
  }
);

// Mettre à jour un type d'événement (Admin seulement)
export const updateEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventTypeId = BigInt(req.params.id);
    const { name, description, isHappyEvent } = req.body;

    const updateData: {
      name?: string;
      description?: string;
      isHappyEvent?: boolean;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isHappyEvent !== undefined) updateData.isHappyEvent = isHappyEvent;

    const updatedEventType = await prisma.eventType.update({
      where: { id: eventTypeId },
      data: updateData,
    });

    res.status(200).json({
      message: "Type d'événement mis à jour avec succès.",
      eventType: serializeBigInt(updatedEventType),
    });
  }
);

// Supprimer un type d'événement (Admin seulement)
export const deleteEventType = asyncHandler(
  async (req: Request, res: Response) => {
    const eventTypeId = BigInt(req.params.id);

    const eventTypeToDelete = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { events: true }, // Vérifier si des événements sont liés
    });

    if (!eventTypeToDelete) {
      return res.status(404).json({ message: "Type d'événement introuvable." });
    }

    if (eventTypeToDelete.events.length > 0) {
      return res
        .status(409)
        .json({
          message:
            "Impossible de supprimer ce type d'événement car des événements y sont liés. Veuillez d'abord supprimer ou modifier ces événements.",
        });
    }

    await prisma.eventType.delete({
      where: { id: eventTypeId },
    });

    res.status(200).json({ message: "Type d'événement supprimé avec succès." });
  }
);
