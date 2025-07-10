import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs"; // Pour le hachage de mot de passe si un admin met à jour le mot de passe

const prisma = new PrismaClient();

// Route pour obtenir le profil de l'utilisateur connecté
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId =
      typeof req.userId === "bigint" ? req.userId : BigInt(String(req.userId));

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        profile: {
          // Inclure le profil s'il existe
          select: {
            phoneNumber: true,
            address: true,
            dateOfBirth: true,
            profilePhotoPath: true,
            isMarried: true,
            isEmployed: true,
            isCivilServant: true,
          },
        },
      },
    });

    if (!userProfile) {
      return res
        .status(404)
        .json({ message: "Profil utilisateur introuvable." });
    }

    res.status(200).json(serializeBigInt(userProfile));
  }
);

// --- Fonctions d'administration des utilisateurs (CRUD par Admin) ---

// Obtenir tous les utilisateurs (Admin seulement)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.status(200).json(serializeBigInt(users));
});

// Obtenir un utilisateur par ID (Admin seulement)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = BigInt(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }

  res.status(200).json(serializeBigInt(user));
});

// Mettre à jour un utilisateur (Admin seulement)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = BigInt(req.params.id);
  const { name, email, isAdmin, isActive, password } = req.body; // Ajout de 'password' ici

  const updateData: {
    name?: string;
    email?: string;
    isAdmin?: boolean;
    isActive?: boolean;
    password?: string;
  } = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) updateData.password = await bcrypt.hash(password, 10); // Hacher le nouveau mot de passe

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    message: "Utilisateur mis à jour avec succès.",
    user: serializeBigInt(updatedUser),
  });
});

// Supprimer un utilisateur (Admin seulement)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = BigInt(req.params.id);

  // Empêcher un administrateur de se supprimer lui-même (facultatif mais recommandé)
  if (req.userId === userId && req.isAdmin) {
    return res
      .status(403)
      .json({
        message:
          "Un administrateur ne peut pas supprimer son propre compte via cette route.",
      });
  }

  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userToDelete) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  res.status(200).json({ message: "Utilisateur supprimé avec succès." });
});
