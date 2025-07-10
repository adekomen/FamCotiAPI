import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt"; // Assurez-vous que ce helper existe

const prisma = new PrismaClient();

// Créer un nouveau profil (généralement lié à un utilisateur fraîchement inscrit)
export const createProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId, // L'ID de l'utilisateur pour lequel le profil est créé
      phoneNumber,
      address,
      dateOfBirth,
      profilePhotoPath,
      isMarried,
      isEmployed,
      isCivilServant,
      parentId, // L'ID du parent si c'est un profil d'enfant
    } = req.body;

    // L'utilisateur appelant la fonction
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
          message: "Utilisateur cible introuvable pour la création du profil.",
        });
    }

    // Vérifier les permissions : seul un admin peut créer un profil pour un autre userId,
    // ou l'utilisateur lui-même pour son propre userId s'il n'a pas déjà de profil.
    if (!isAdmin && BigInt(userId) !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Non autorisé à créer un profil pour un autre utilisateur.",
        });
    }

    // Vérifier si un profil existe déjà pour cet userId
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (existingProfile) {
      return res
        .status(409)
        .json({
          message:
            "Un profil existe déjà pour cet utilisateur. Utilisez la mise à jour.",
        });
    }

    // Si parentId est fourni, vérifier qu'il existe
    if (parentId) {
      const parentExists = await prisma.user.findUnique({
        where: { id: BigInt(parentId) },
      });
      if (!parentExists) {
        return res
          .status(404)
          .json({ message: "Parent spécifié introuvable." });
      }
    }

    const newProfile = await prisma.profile.create({
      data: {
        user: { connect: { id: BigInt(userId) } }, // Connexion au User
        phoneNumber,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        profilePhotoPath,
        isMarried: isMarried ?? false,
        isEmployed: isEmployed ?? false,
        isCivilServant: isCivilServant ?? false,
        parent: parentId ? { connect: { id: BigInt(parentId) } } : undefined, // Connexion au Parent si parentId est fourni
      },
    });

    res.status(201).json({
      message: "Profil créé avec succès.",
      profile: serializeBigInt(newProfile),
    });
  }
);

// Obtenir tous les profils (réservé aux admins)
export const getAllProfiles = asyncHandler(
  async (req: Request, res: Response) => {
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé. Réservé aux administrateurs." });
    }

    const profiles = await prisma.profile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true, email: true } },
      },
    });
    res.status(200).json(serializeBigInt(profiles));
  }
);

// Obtenir un profil par son ID (profileId)
export const getProfileById = asyncHandler(
  async (req: Request, res: Response) => {
    const profileId = BigInt(req.params.id); // C'est l'ID du profil, pas l'ID de l'utilisateur
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        parent: { select: { id: true, name: true, email: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    // Vérifier les permissions : l'utilisateur peut voir son propre profil, un admin peut voir n'importe quel profil
    if (!isAdmin && profile.userId !== currentUserId) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à ce profil." });
    }

    res.status(200).json(serializeBigInt(profile));
  }
);

// Mettre à jour un profil
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileId = BigInt(req.params.id); // L'ID du profil à modifier
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!existingProfile) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    // Vérifier les permissions : seul l'admin ou l'utilisateur dont c'est le profil peut le modifier
    if (!isAdmin && existingProfile.userId !== currentUserId) {
      return res
        .status(403)
        .json({
          message: "Accès non autorisé à la modification de ce profil.",
        });
    }

    const {
      phoneNumber,
      address,
      dateOfBirth,
      profilePhotoPath,
      isMarried,
      isEmployed,
      isCivilServant,
      parentId, // Peut être utilisé pour changer/ajouter/supprimer le parent
    } = req.body;

    const updateData: any = {};
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined)
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (profilePhotoPath !== undefined)
      updateData.profilePhotoPath = profilePhotoPath;
    if (isMarried !== undefined) updateData.isMarried = isMarried;
    if (isEmployed !== undefined) updateData.isEmployed = isEmployed;
    if (isCivilServant !== undefined)
      updateData.isCivilServant = isCivilServant;

    // Gestion de la relation parent
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parent = { disconnect: true }; // Si parentId est null, déconnecter le parent
      } else {
        const newParent = await prisma.user.findUnique({
          where: { id: BigInt(parentId) },
        });
        if (!newParent) {
          return res
            .status(404)
            .json({ message: "Nouveau parent spécifié introuvable." });
        }
        updateData.parent = { connect: { id: BigInt(parentId) } }; // Connecter au nouveau parent
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: updateData,
    });

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      profile: serializeBigInt(updatedProfile),
    });
  }
);

// Supprimer un profil (réservé aux admins, ou l'utilisateur lui-même pourrait supprimer son profil?)
// Attention: Si onDelete: Cascade sur UserProfile, la suppression de l'utilisateur supprime le profil.
// Cette fonction pourrait être utile si on veut juste supprimer le profil sans supprimer l'utilisateur.
export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const profileId = BigInt(req.params.id);
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!existingProfile) {
      return res.status(404).json({ message: "Profil introuvable." });
    }

    // Vérifier les permissions : seul l'admin peut supprimer n'importe quel profil.
    // Un utilisateur ne devrait probablement pas pouvoir supprimer son propre profil sans supprimer son compte.
    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à la suppression de ce profil." });
    }

    await prisma.profile.delete({
      where: { id: profileId },
    });

    res.status(200).json({ message: "Profil supprimé avec succès." });
  }
);
