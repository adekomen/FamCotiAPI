import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer une nouvelle sanction (Admin seulement)
export const createSanction = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId, // L'utilisateur sanctionné
      reason,
      startDate,
      endDate, // Optionnel
      createdById, // L'administrateur qui crée la sanction
    } = req.body;

    const currentAdminId = req.userId as bigint; // L'ID de l'admin connecté
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
              "Seul un administrateur peut créer des sanctions, et createdById doit être un ID d'administrateur valide.",
          });
      }
    }

    // Vérifier si l'utilisateur sanctionné existe
    const userExists = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!userExists) {
      return res
        .status(404)
        .json({ message: "Utilisateur sanctionné introuvable." });
    }

    const newSanction = await prisma.sanction.create({
      data: {
        user: { connect: { id: BigInt(userId) } },
        reason,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        createdBy: { connect: { id: BigInt(createdById) } },
      },
    });

    res.status(201).json({
      message: "Sanction créée avec succès.",
      sanction: serializeBigInt(newSanction),
    });
  }
);

// Obtenir toutes les sanctions (Admin peut tout voir, utilisateur non-admin voit les siennes)
export const getAllSanctions = asyncHandler(
  async (req: Request, res: Response) => {
    const isAdmin = req.isAdmin as boolean;
    const currentUserId = req.userId as bigint;

    const { userId, resolved } = req.query; // Filter by userId and resolved status

    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.userId = currentUserId; // Non-admin can only see their own sanctions
    } else {
      // Admin can filter
      if (userId) whereClause.userId = BigInt(userId as string);
      if (resolved !== undefined) {
        whereClause.resolvedAt = resolved === "true" ? { not: null } : null; // Filter for resolved (not null) or not resolved (null)
      }
    }

    const sanctions = await prisma.sanction.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startDate: "desc" },
    });

    res.status(200).json(serializeBigInt(sanctions));
  }
);

// Obtenir une sanction par son ID
export const getSanctionById = asyncHandler(
  async (req: Request, res: Response) => {
    const sanctionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const sanction = await prisma.sanction.findUnique({
      where: { id: sanctionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!sanction) {
      return res.status(404).json({ message: "Sanction introuvable." });
    }

    // Permissions : Admin peut voir n'importe quelle sanction. L'utilisateur concerné peut voir la sienne.
    if (!isAdmin && sanction.userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à cette sanction." });
    }

    res.status(200).json(serializeBigInt(sanction));
  }
);

// Mettre à jour une sanction (Admin seulement)
export const updateSanction = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanctionId = BigInt(req.params.id);
    const currentAdminId = req.userId as bigint; // L'admin connecté
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier les sanctions." });
    }

    const existingSanction = await prisma.sanction.findUnique({
      where: { id: sanctionId },
    });

    if (!existingSanction) {
      return res.status(404).json({ message: "Sanction introuvable." });
    }

    const {
      userId, // Changing user for existing sanction is generally not allowed, or requires specific logic
      reason,
      startDate,
      endDate,
      resolvedAt,
      resolvedById,
      resolutionNotes,
      createdById, // Should not change after creation, or requires specific admin logic
    } = req.body;

    const updateData: any = {};
    if (reason !== undefined) updateData.reason = reason;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (resolutionNotes !== undefined)
      updateData.resolutionNotes = resolutionNotes;

    // Champs de résolution : resolvedAt, resolvedById
    if (resolvedAt !== undefined)
      updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null;
    if (resolvedById !== undefined) {
      if (resolvedById === null) {
        updateData.resolvedBy = { disconnect: true };
      } else {
        const resolverExists = await prisma.user.findUnique({
          where: { id: BigInt(resolvedById) },
        });
        if (!resolverExists || !resolverExists.isAdmin) {
          return res
            .status(404)
            .json({
              message:
                'L\'utilisateur "resolvedById" doit être un administrateur valide ou null.',
            });
        }
        updateData.resolvedBy = { connect: { id: BigInt(resolvedById) } };
      }
    } else if (
      resolvedAt !== undefined &&
      resolvedAt !== null &&
      existingSanction.resolvedById === null
    ) {
      // If resolvedAt is set but resolvedById is not provided and was null, default to current admin
      updateData.resolvedBy = { connect: { id: currentAdminId } };
    }

    // userId and createdById are usually immutable for a sanction, but if allowed, add validation here
    if (userId !== undefined) {
      // If you allow changing userId for a sanction, ensure the new user exists and handle implications
      return res
        .status(400)
        .json({
          message:
            "La modification de l'utilisateur sanctionné n'est pas autorisée directement via cette route.",
        });
    }
    if (createdById !== undefined) {
      // If you allow changing createdById, ensure the new user is an admin
      return res
        .status(400)
        .json({
          message:
            "La modification de l'utilisateur créateur n'est pas autorisée directement via cette route.",
        });
    }

    const updatedSanction = await prisma.sanction.update({
      where: { id: sanctionId },
      data: updateData,
    });

    res.status(200).json({
      message: "Sanction mise à jour avec succès.",
      sanction: serializeBigInt(updatedSanction),
    });
  }
);

// Supprimer une sanction (Admin seulement)
export const deleteSanction = asyncHandler(
  async (req: Request, res: Response) => {
    const sanctionId = BigInt(req.params.id);
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer les sanctions." });
    }

    const existingSanction = await prisma.sanction.findUnique({
      where: { id: sanctionId },
    });

    if (!existingSanction) {
      return res.status(404).json({ message: "Sanction introuvable." });
    }

    await prisma.sanction.delete({
      where: { id: sanctionId },
    });

    res.status(200).json({ message: "Sanction supprimée avec succès." });
  }
);
