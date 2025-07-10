import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Assurez-vous que cette valeur est la même partout où elle est utilisée pour les tests !

// Fonction d'inscription d'un nouvel utilisateur
export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "Cet email est déjà utilisé." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
    },
  });

  const userIdAsNumber = Number(newUser.id); // Convert BigInt to Number for JWT payload

  const token = jwt.sign(
    { userId: userIdAsNumber, email: newUser.email, isAdmin: newUser.isAdmin },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(201).json({
    message: "Utilisateur enregistré avec succès",
    token,
    user: serializeBigInt(newUser),
  });
});

// Fonction de connexion d'un utilisateur existant
export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res
      .status(401)
      .json({ message: "Email ou mot de passe incorrect." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ message: "Email ou mot de passe incorrect." });
  }

  if (!user.isActive) {
    return res.status(403).json({
      message:
        "Votre compte est désactivé. Veuillez contacter l'administrateur.",
    });
  }

  const userIdAsNumber = Number(user.id); // Convert BigInt to Number for JWT payload

  const token = jwt.sign(
    { userId: userIdAsNumber, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    message: "Connexion réussie",
    token,
    user: serializeBigInt(user),
  });
});

// Nouvelle fonction: Changer le mot de passe de l'utilisateur
export const changePassword = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Non autorisé, utilisateur non identifié." });
    }

    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res
        .status(401)
        .json({ message: "Ancien mot de passe incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  }
);
