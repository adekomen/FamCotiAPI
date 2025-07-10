import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";
import { APIFeatures } from "../utils/apiFeatures";

const prisma = new PrismaClient();

// @desc    Créer une demande d'assistance
// @route   POST /api/assistance-requests
// @access  Private
export const createAssistanceRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, title, description, amountRequested, status } = req.body;
    const userId = req.userId as bigint; // L'utilisateur authentifié

    // Vérifier si l'événement existe si eventId est fourni
    if (eventId) {
      const eventExists = await prisma.event.findUnique({
        where: { id: BigInt(eventId) },
      });
      if (!eventExists) {
        res.status(404);
        throw new Error("L'événement spécifié n'existe pas.");
      }
    }

    const newAssistanceRequest = await prisma.assistanceRequest.create({
      data: {
        userId: userId,
        eventId: eventId ? BigInt(eventId) : null,
        title,
        description,
        amountRequested,
        status,
      },
    });

    res.status(201).json(serializeBigInt(newAssistanceRequest));
  }
);

// @desc    Obtenir toutes les demandes d'assistance (Admin) ou celles de l'utilisateur (Normal User) avec pagination, tri et filtrage
// @route   GET /api/assistance-requests
// @access  Private
export const getAssistanceRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    // Champs autorisés pour le tri et la recherche pour le modèle AssistanceRequest
    const allowedSortFields = [
      "id",
      "userId",
      "eventId",
      "title",
      "status",
      "amountRequested",
      "createdAt",
      "updatedAt",
    ];
    const searchableFields = ["title", "description", "status"]; // Champs textuels sur lesquels rechercher

    // Construire les options de requête avec APIFeatures
    const features = new APIFeatures<
      Prisma.AssistanceRequestWhereInput,
      Prisma.AssistanceRequestOrderByWithRelationInput
    >(
      req.query,
      10, // Default limit
      allowedSortFields,
      searchableFields
    );

    // Appliquer le filtrage, la recherche, le tri et la pagination
    features.filter().search().sort().paginate();

    const prismaOptions = features.getPrismaOptions();

    // Condition WHERE spécifique pour les utilisateurs non-admins
    let whereClause: Prisma.AssistanceRequestWhereInput =
      prismaOptions.where || {};

    if (!isAdmin) {
      // Si ce n'est pas un admin, il ne doit voir que ses propres demandes
      whereClause = {
        AND: [
          whereClause, // Garder les filtres existants de la query string
          { userId: currentUserId },
        ],
      };
    }

    // Obtenir le nombre total de demandes correspondant aux filtres pour la pagination
    const totalRequests = await prisma.assistanceRequest.count({
      where: whereClause,
    });

    // Obtenir les demandes avec les options et les includes nécessaires
    const assistanceRequests = await prisma.assistanceRequest.findMany({
      ...prismaOptions,
      where: whereClause, // Appliquer la clause WHERE potentiellement modifiée
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      total: totalRequests,
      results: assistanceRequests.length,
      data: serializeBigInt(assistanceRequests),
    });
  }
);

export const getAllAssistanceRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    // Champs autorisés pour le tri et la recherche pour le modèle AssistanceRequest
    const allowedSortFields = [
      "id",
      "userId",
      "eventId",
      "title",
      "status",
      "amountRequested",
      "createdAt",
      "updatedAt",
    ];
    const searchableFields = ["title", "description", "status"]; // Champs textuels sur lesquels rechercher

    // Construire les options de requête avec APIFeatures
    const features = new APIFeatures<
      Prisma.AssistanceRequestWhereInput,
      Prisma.AssistanceRequestOrderByWithRelationInput
    >(
      req.query,
      10, // Default limit
      allowedSortFields,
      searchableFields
    );

    // Appliquer le filtrage, la recherche, le tri et la pagination
    features.filter().search().sort().paginate();

    const prismaOptions = features.getPrismaOptions();

    // Condition WHERE spécifique pour les utilisateurs non-admins
    let whereClause: Prisma.AssistanceRequestWhereInput =
      prismaOptions.where || {};

    if (!isAdmin) {
      // Si ce n'est pas un admin, il ne doit voir que ses propres demandes
      whereClause = {
        AND: [
          whereClause, // Garder les filtres existants de la query string
          { userId: currentUserId },
        ],
      };
    }

    // Obtenir le nombre total de demandes correspondant aux filtres pour la pagination
    const totalRequests = await prisma.assistanceRequest.count({
      where: whereClause,
    });

    // Obtenir les demandes avec les options et les includes nécessaires
    const assistanceRequests = await prisma.assistanceRequest.findMany({
      ...prismaOptions,
      where: whereClause, // Appliquer la clause WHERE potentiellement modifiée
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      total: totalRequests,
      results: assistanceRequests.length,
      data: serializeBigInt(assistanceRequests),
    });
  }
);

// @desc    Obtenir une demande d'assistance par ID
// @route   GET /api/assistance-requests/:id
// @access  Private (Admin ou le propriétaire de la demande)
export const getAssistanceRequestById = asyncHandler(
  async (req: Request, res: Response) => {
    const requestId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const assistanceRequest = await prisma.assistanceRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!assistanceRequest) {
      return res
        .status(404)
        .json({ message: "Demande d'assistance introuvable." });
    }

    // Autorisation : Admin ou propriétaire de la demande
    if (!isAdmin && assistanceRequest.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Non autorisé à accéder à cette demande d'assistance.",
        });
    }

    res.status(200).json(serializeBigInt(assistanceRequest));
  }
);

// @desc    Mettre à jour une demande d'assistance
// @route   PUT /api/assistance-requests/:id
// @access  Private (Admin ou le propriétaire de la demande)
export const updateAssistanceRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;
    const { eventId, title, description, amountRequested, status } = req.body;

    const existingRequest = await prisma.assistanceRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return res
        .status(404)
        .json({ message: "Demande d'assistance introuvable." });
    }

    // Autorisation : Admin ou propriétaire de la demande
    if (!isAdmin && existingRequest.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Non autorisé à mettre à jour cette demande d'assistance.",
        });
    }

    // Vérifier si l'événement existe si eventId est fourni
    let eventBigInt: bigint | null = existingRequest.eventId;
    if (eventId !== undefined) {
      if (eventId === null) {
        eventBigInt = null;
      } else {
        eventBigInt = BigInt(eventId);
        const eventExists = await prisma.event.findUnique({
          where: { id: eventBigInt },
        });
        if (!eventExists) {
          res.status(404);
          throw new Error("L'événement spécifié n'existe pas.");
        }
      }
    }

    const updatedAssistanceRequest = await prisma.assistanceRequest.update({
      where: { id: requestId },
      data: {
        eventId: eventBigInt,
        title: title ?? existingRequest.title,
        description: description ?? existingRequest.description,
        amountRequested: amountRequested ?? existingRequest.amountRequested,
        status: status ?? existingRequest.status,
      },
    });

    res.status(200).json(serializeBigInt(updatedAssistanceRequest));
  }
);

// @desc    Supprimer une demande d'assistance
// @route   DELETE /api/assistance-requests/:id
// @access  Private (Admin ou le propriétaire de la demande)
export const deleteAssistanceRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const requestId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingRequest = await prisma.assistanceRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return res
        .status(404)
        .json({ message: "Demande d'assistance introuvable." });
    }

    // Autorisation : Admin ou propriétaire de la demande
    if (!isAdmin && existingRequest.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Non autorisé à supprimer cette demande d'assistance.",
        });
    }

    await prisma.assistanceRequest.delete({ where: { id: requestId } });

    res
      .status(200)
      .json({ message: "Demande d'assistance supprimée avec succès." });
  }
);
