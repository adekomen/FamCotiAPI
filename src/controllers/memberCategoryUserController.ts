import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Assigner un utilisateur à une catégorie (Admin seulement)
export const assignUserToCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, categoryId } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!userExists) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const categoryExists = await prisma.memberCategory.findUnique({
      where: { id: BigInt(categoryId) },
    });
    if (!categoryExists) {
      return res
        .status(404)
        .json({ message: "Catégorie de membre introuvable." });
    }

    const existingAssignment = await prisma.memberCategoryUser.findUnique({
      where: {
        userId_categoryId: {
          userId: BigInt(userId),
          categoryId: BigInt(categoryId),
        },
      },
    });

    if (existingAssignment) {
      return res
        .status(409)
        .json({
          message: "Cet utilisateur est déjà assigné à cette catégorie.",
        });
    }

    const newAssignment = await prisma.memberCategoryUser.create({
      data: {
        user: { connect: { id: BigInt(userId) } },
        category: { connect: { id: BigInt(categoryId) } },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      message: "Utilisateur assigné à la catégorie avec succès.",
      assignment: serializeBigInt(newAssignment),
    });
  }
);

// Obtenir toutes les associations (Admin seulement, avec filtres)
export const getAllUserCategoryAssignments = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, categoryId } = req.query;

    const whereClause: any = {};
    if (userId) whereClause.userId = BigInt(userId as string);
    if (categoryId) whereClause.categoryId = BigInt(categoryId as string);

    const assignments = await prisma.memberCategoryUser.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(serializeBigInt(assignments));
  }
);

// Obtenir une association spécifique par userId et categoryId (Admin seulement)
export const getUserCategoryAssignment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = BigInt(req.params.userId);
    const categoryId = BigInt(req.params.categoryId);

    const assignment = await prisma.memberCategoryUser.findUnique({
      where: {
        userId_categoryId: {
          userId: userId,
          categoryId: categoryId,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Assignation utilisateur-catégorie introuvable." });
    }

    res.status(200).json(serializeBigInt(assignment));
  }
);

// Supprimer une assignation (dissocier un utilisateur d'une catégorie) (Admin seulement)
export const unassignUserFromCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = BigInt(req.params.userId);
    const categoryId = BigInt(req.params.categoryId);

    const existingAssignment = await prisma.memberCategoryUser.findUnique({
      where: {
        userId_categoryId: {
          userId: userId,
          categoryId: categoryId,
        },
      },
    });

    if (!existingAssignment) {
      return res
        .status(404)
        .json({ message: "Assignation utilisateur-catégorie introuvable." });
    }

    await prisma.memberCategoryUser.delete({
      where: {
        userId_categoryId: {
          userId: userId,
          categoryId: categoryId,
        },
      },
    });

    res
      .status(200)
      .json({ message: "Utilisateur dissocié de la catégorie avec succès." });
  }
);
