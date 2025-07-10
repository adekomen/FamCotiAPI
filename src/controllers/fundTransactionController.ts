import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer une nouvelle transaction de fonds (Admin seulement)
export const createFundTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      transactionType, // ex: "credit", "debit"
      amount,
      description,
      transactionDate,
      monthlyContributionId,
      eventContributionId,
      assistanceRequestId,
      balanceAfter, // Peut être calculé côté backend, mais ici on le prend du front pour le moment
      createdById, // L'utilisateur qui enregistre la transaction (admin)
    } = req.body;

    const currentUserId = req.userId as bigint; // ID de l'admin qui effectue l'opération

    // Vérifier si createdById est fourni, et si c'est l'admin courant ou un admin spécifique
    if (createdById && BigInt(createdById) !== currentUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: BigInt(createdById) },
      });
      if (!targetUser || !targetUser.isAdmin) {
        return res
          .status(403)
          .json({
            message:
              'L\'utilisateur "createdById" doit être un administrateur valide.',
          });
      }
    } else {
      // Si createdById n'est pas fourni, par défaut, c'est l'admin courant
      req.body.createdById = currentUserId;
    }

    // Valider les IDs de relations
    if (monthlyContributionId) {
      const mcExists = await prisma.monthlyContribution.findUnique({
        where: { id: BigInt(monthlyContributionId) },
      });
      if (!mcExists)
        return res
          .status(404)
          .json({ message: "Contribution mensuelle associée introuvable." });
    }
    if (eventContributionId) {
      const ecExists = await prisma.eventContribution.findUnique({
        where: { id: BigInt(eventContributionId) },
      });
      if (!ecExists)
        return res
          .status(404)
          .json({ message: "Contribution d'événement associée introuvable." });
    }
    if (assistanceRequestId) {
      const arExists = await prisma.assistanceRequest.findUnique({
        where: { id: BigInt(assistanceRequestId) },
      });
      if (!arExists)
        return res
          .status(404)
          .json({ message: "Demande d'assistance associée introuvable." });
    }

    // Assurer qu'une seule source est liée à la transaction
    const linkedSources = [
      monthlyContributionId,
      eventContributionId,
      assistanceRequestId,
    ].filter(Boolean).length;
    if (linkedSources > 1) {
      return res
        .status(400)
        .json({
          message:
            "Une transaction de fonds doit être liée à une seule source (contribution mensuelle, contribution d'événement ou demande d'assistance).",
        });
    }
    if (linkedSources === 0 && transactionType === "credit") {
      // Pour un crédit, il devrait y avoir une source spécifique, sauf si c'est un dépôt initial
      // Vous pouvez ajuster cette logique selon vos besoins métier (ex: dépôt initial sans source)
    }

    const newTransaction = await prisma.fundTransaction.create({
      data: {
        transactionType,
        amount: parseFloat(amount),
        description,
        transactionDate: new Date(transactionDate),
        monthlyContribution: monthlyContributionId
          ? { connect: { id: BigInt(monthlyContributionId) } }
          : undefined,
        eventContribution: eventContributionId
          ? { connect: { id: BigInt(eventContributionId) } }
          : undefined,
        assistanceRequest: assistanceRequestId
          ? { connect: { id: BigInt(assistanceRequestId) } }
          : undefined,
        balanceAfter: parseFloat(balanceAfter), // Important: logic for calculating balanceAfter may need to be in backend in a real app
        createdBy: { connect: { id: BigInt(req.body.createdById) } },
      },
    });

    res.status(201).json({
      message: "Transaction de fonds créée avec succès.",
      fundTransaction: serializeBigInt(newTransaction),
    });
  }
);

// Obtenir toutes les transactions de fonds (Admin seulement, avec filtres)
export const getAllFundTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      transactionType,
      createdById,
      monthlyContributionId,
      eventContributionId,
      assistanceRequestId,
    } = req.query;

    const whereClause: any = {};
    if (transactionType)
      whereClause.transactionType = transactionType as string;
    if (createdById) whereClause.createdById = BigInt(createdById as string);
    if (monthlyContributionId)
      whereClause.monthlyContributionId = BigInt(
        monthlyContributionId as string
      );
    if (eventContributionId)
      whereClause.eventContributionId = BigInt(eventContributionId as string);
    if (assistanceRequestId)
      whereClause.assistanceRequestId = BigInt(assistanceRequestId as string);

    const fundTransactions = await prisma.fundTransaction.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        monthlyContribution: true,
        eventContribution: true,
        assistanceRequest: true,
      },
      orderBy: { transactionDate: "desc" },
    });

    res.status(200).json(serializeBigInt(fundTransactions));
  }
);

// Obtenir une transaction de fonds par son ID (Admin seulement)
export const getFundTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const transactionId = BigInt(req.params.id);

    const fundTransaction = await prisma.fundTransaction.findUnique({
      where: { id: transactionId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        monthlyContribution: true,
        eventContribution: true,
        assistanceRequest: true,
      },
    });

    if (!fundTransaction) {
      return res
        .status(404)
        .json({ message: "Transaction de fonds introuvable." });
    }

    res.status(200).json(serializeBigInt(fundTransaction));
  }
);

// Mettre à jour une transaction de fonds (Admin seulement)
export const updateFundTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transactionId = BigInt(req.params.id);
    const {
      transactionType,
      amount,
      description,
      transactionDate,
      monthlyContributionId,
      eventContributionId,
      assistanceRequestId,
      balanceAfter,
      createdById,
    } = req.body;

    const existingTransaction = await prisma.fundTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return res
        .status(404)
        .json({ message: "Transaction de fonds introuvable." });
    }

    const updateData: any = {};
    if (transactionType !== undefined)
      updateData.transactionType = transactionType;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (transactionDate !== undefined)
      updateData.transactionDate = new Date(transactionDate);
    if (balanceAfter !== undefined)
      updateData.balanceAfter = parseFloat(balanceAfter);

    if (createdById !== undefined) {
      const userExists = await prisma.user.findUnique({
        where: { id: BigInt(createdById) },
      });
      if (!userExists || !userExists.isAdmin) {
        // Only allow connecting to admin for createdBy
        return res
          .status(404)
          .json({
            message:
              'L\'utilisateur "createdById" doit être un administrateur valide.',
          });
      }
      updateData.createdBy = { connect: { id: BigInt(createdById) } };
    }

    // Gestion des relations (connexion/déconnexion)
    // Il faut s'assurer qu'il n'y ait qu'une seule connexion à la fois.
    // Si l'une des ID est null, cela signifie une déconnexion.
    // Si une nouvelle ID est fournie, cela signifie une nouvelle connexion.
    const hasMonthly = monthlyContributionId !== undefined;
    const hasEvent = eventContributionId !== undefined;
    const hasAssistance = assistanceRequestId !== undefined;

    const providedRelationsCount = [hasMonthly, hasEvent, hasAssistance].filter(
      Boolean
    ).length;

    if (providedRelationsCount > 1) {
      return res
        .status(400)
        .json({
          message:
            "Une transaction de fonds ne peut être liée qu'à une seule source.",
        });
    }

    // Disconnect existing relations if any related ID is explicitly null or not provided
    if (hasMonthly) {
      updateData.monthlyContribution =
        monthlyContributionId === null
          ? { disconnect: true }
          : { connect: { id: BigInt(monthlyContributionId) } };
      if (monthlyContributionId !== null) {
        const mcExists = await prisma.monthlyContribution.findUnique({
          where: { id: BigInt(monthlyContributionId) },
        });
        if (!mcExists)
          return res
            .status(404)
            .json({ message: "Contribution mensuelle associée introuvable." });
      }
    } else {
      // If monthlyContributionId is not provided at all, ensure other connections are handled if they existed previously
      // This logic might need to be refined based on specific business rules.
    }

    if (hasEvent) {
      updateData.eventContribution =
        eventContributionId === null
          ? { disconnect: true }
          : { connect: { id: BigInt(eventContributionId) } };
      if (eventContributionId !== null) {
        const ecExists = await prisma.eventContribution.findUnique({
          where: { id: BigInt(eventContributionId) },
        });
        if (!ecExists)
          return res
            .status(404)
            .json({
              message: "Contribution d'événement associée introuvable.",
            });
      }
    } else {
      // Similar handling as above
    }

    if (hasAssistance) {
      updateData.assistanceRequest =
        assistanceRequestId === null
          ? { disconnect: true }
          : { connect: { id: BigInt(assistanceRequestId) } };
      if (assistanceRequestId !== null) {
        const arExists = await prisma.assistanceRequest.findUnique({
          where: { id: BigInt(assistanceRequestId) },
        });
        if (!arExists)
          return res
            .status(404)
            .json({ message: "Demande d'assistance associée introuvable." });
      }
    } else {
      // Similar handling as above
    }

    const updatedTransaction = await prisma.fundTransaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    res.status(200).json({
      message: "Transaction de fonds mise à jour avec succès.",
      fundTransaction: serializeBigInt(updatedTransaction),
    });
  }
);

// Supprimer une transaction de fonds (Admin seulement)
export const deleteFundTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transactionId = BigInt(req.params.id);

    const existingTransaction = await prisma.fundTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return res
        .status(404)
        .json({ message: "Transaction de fonds introuvable." });
    }

    await prisma.fundTransaction.delete({
      where: { id: transactionId },
    });

    res
      .status(200)
      .json({ message: "Transaction de fonds supprimée avec succès." });
  }
);
