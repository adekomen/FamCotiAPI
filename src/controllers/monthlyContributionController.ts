import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer une nouvelle contribution mensuelle
export const createMonthlyContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId, // L'ID de l'utilisateur qui effectue la contribution (peut être l'utilisateur connecté ou un autre si admin)
      amount,
      month,
      year,
      paymentDate,
      paymentMethod,
      transactionReference,
      notes,
    } = req.body;

    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    // Vérifier si l'utilisateur cible (userId) existe
    const targetUser = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({
          message: "Utilisateur cible introuvable pour la contribution.",
        });
    }

    // Permissions : Un utilisateur peut créer sa propre contribution. Un admin peut créer une contribution pour n'importe qui.
    if (!isAdmin && BigInt(userId) !== currentUserId) {
      return res
        .status(403)
        .json({
          message:
            "Non autorisé à créer une contribution pour un autre utilisateur.",
        });
    }

    // Vérifier si une contribution pour le même utilisateur, mois et année existe déjà
    const existingContribution = await prisma.monthlyContribution.findFirst({
      where: {
        userId: BigInt(userId),
        month: month,
        year: year,
      },
    });

    if (existingContribution) {
      // Si une contribution existe déjà pour ce mois/année, suggérer une mise à jour au lieu d'une nouvelle création
      return res.status(409).json({
        message:
          "Une contribution existe déjà pour cet utilisateur pour le mois et l'année spécifiés. Veuillez la mettre à jour si nécessaire.",
        existingContributionId: serializeBigInt(existingContribution.id), // Retourne l'ID existant pour faciliter la mise à jour
      });
    }

    const newContribution = await prisma.monthlyContribution.create({
      data: {
        user: { connect: { id: BigInt(userId) } }, // Connexion à l'utilisateur
        amount: parseFloat(amount), // Assurer que le montant est un Float
        month: parseInt(month), // Assurer que le mois est un Int
        year: parseInt(year), // Assurer que l'année est un Int
        paymentDate: new Date(paymentDate), // Convertir en objet Date
        paymentMethod,
        transactionReference,
        notes,
      },
    });

    res.status(201).json({
      message: "Contribution mensuelle créée avec succès.",
      contribution: serializeBigInt(newContribution),
    });
  }
);

// Obtenir toutes les contributions mensuelles (avec filtres optionnels)
export const getAllMonthlyContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const isAdmin = req.isAdmin as boolean;
    const currentUserId = req.userId as bigint;

    const { userId, month, year } = req.query; // Récupérer les paramètres de requête

    const whereClause: any = {};

    // Si l'utilisateur n'est pas admin, il ne peut voir que ses propres contributions
    if (!isAdmin) {
      whereClause.userId = currentUserId;
    } else if (userId) {
      // Si admin et userId est fourni dans la query, filtrer par cet userId
      whereClause.userId = BigInt(userId as string);
    }

    if (month) {
      whereClause.month = parseInt(month as string);
    }
    if (year) {
      whereClause.year = parseInt(year as string);
    }

    const contributions = await prisma.monthlyContribution.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        paymentDate: "desc", // Trier par la date de paiement la plus récente
      },
    });

    res.status(200).json(serializeBigInt(contributions));
  }
);

// Obtenir une contribution mensuelle par son ID
export const getMonthlyContributionById = asyncHandler(
  async (req: Request, res: Response) => {
    const contributionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const contribution = await prisma.monthlyContribution.findUnique({
      where: { id: contributionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!contribution) {
      return res
        .status(404)
        .json({ message: "Contribution mensuelle introuvable." });
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

// Mettre à jour une contribution mensuelle
export const updateMonthlyContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contributionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingContribution = await prisma.monthlyContribution.findUnique({
      where: { id: contributionId },
    });

    if (!existingContribution) {
      return res
        .status(404)
        .json({ message: "Contribution mensuelle introuvable." });
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
      amount,
      month,
      year,
      paymentDate,
      paymentMethod,
      transactionReference,
      notes,
    } = req.body;

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (month !== undefined) updateData.month = parseInt(month);
    if (year !== undefined) updateData.year = parseInt(year);
    if (paymentDate !== undefined)
      updateData.paymentDate = new Date(paymentDate);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (transactionReference !== undefined)
      updateData.transactionReference = transactionReference;
    if (notes !== undefined) updateData.notes = notes;

    const updatedContribution = await prisma.monthlyContribution.update({
      where: { id: contributionId },
      data: updateData,
    });

    res.status(200).json({
      message: "Contribution mensuelle mise à jour avec succès.",
      contribution: serializeBigInt(updatedContribution),
    });
  }
);

// Supprimer une contribution mensuelle
export const deleteMonthlyContribution = asyncHandler(
  async (req: Request, res: Response) => {
    const contributionId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingContribution = await prisma.monthlyContribution.findUnique({
      where: { id: contributionId },
    });

    if (!existingContribution) {
      return res
        .status(404)
        .json({ message: "Contribution mensuelle introuvable." });
    }

    // Permissions : Seul l'admin ou l'utilisateur concerné peut supprimer sa contribution
    if (!isAdmin && existingContribution.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Accès non autorisé à la suppression de cette contribution.",
        });
    }

    await prisma.monthlyContribution.delete({
      where: { id: contributionId },
    });

    res
      .status(200)
      .json({ message: "Contribution mensuelle supprimée avec succès." });
  }
);
