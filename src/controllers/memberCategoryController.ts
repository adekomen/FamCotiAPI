import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt"; // Pour gérer les BigInt dans les réponses

const prisma = new PrismaClient();

// Créer une nouvelle catégorie de membre
export const createMemberCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, monthlyContributionAmount } = req.body;

    // Vérifier si une catégorie avec le même nom existe déjà
    // CHANGEMENT ICI : Utiliser findFirst au lieu de findUnique
    const existingCategory = await prisma.memberCategory.findFirst({
      where: { name: name },
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Une catégorie avec ce nom existe déjà." });
    }

    const newCategory = await prisma.memberCategory.create({
      data: {
        name,
        description,
        monthlyContributionAmount,
      },
    });

    res.status(201).json({
      message: "Catégorie de membre créée avec succès.",
      category: serializeBigInt(newCategory),
    });
  }
);

// Obtenir toutes les catégories de membres
export const getMemberCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await prisma.memberCategory.findMany();
    res.status(200).json(serializeBigInt(categories));
  }
);

// Obtenir une catégorie de membre par son ID
export const getMemberCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    // L'ID vient des paramètres de l'URL, il est toujours une string, donc on le convertit en BigInt
    const categoryId = BigInt(req.params.id);

    const category = await prisma.memberCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: "Catégorie de membre introuvable." });
    }

    res.status(200).json(serializeBigInt(category));
  }
);

// Mettre à jour une catégorie de membre
export const updateMemberCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = BigInt(req.params.id);
    const { name, description, monthlyContributionAmount } = req.body;

    const updatedCategory = await prisma.memberCategory.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        monthlyContributionAmount,
      },
    });

    res.status(200).json({
      message: "Catégorie de membre mise à jour avec succès.",
      category: serializeBigInt(updatedCategory),
    });
  }
);

// Supprimer une catégorie de membre
export const deleteMemberCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = BigInt(req.params.id);

    // Vérifier si la catégorie existe avant de tenter de la supprimer
    const categoryToDelete = await prisma.memberCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryToDelete) {
      return res
        .status(404)
        .json({ message: "Catégorie de membre introuvable." });
    }

    await prisma.memberCategory.delete({
      where: { id: categoryId },
    });

    res
      .status(200)
      .json({ message: "Catégorie de membre supprimée avec succès." });
  }
);
