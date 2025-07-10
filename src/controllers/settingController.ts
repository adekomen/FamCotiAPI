import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer un nouveau paramètre (Admin seulement)
export const createSetting = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key, value, description } = req.body;

    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (existingSetting) {
      return res
        .status(409)
        .json({ message: "Un paramètre avec cette clé existe déjà." });
    }

    const newSetting = await prisma.setting.create({
      data: {
        key,
        value,
        description,
      },
    });

    res.status(201).json({
      message: "Paramètre créé avec succès.",
      setting: serializeBigInt(newSetting),
    });
  }
);

// Obtenir tous les paramètres (Admin seulement, ou certains publics si besoin)
// Pour l'instant, réservé aux admins
export const getAllSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const settings = await prisma.setting.findMany({
      orderBy: { key: "asc" },
    });
    res.status(200).json(serializeBigInt(settings));
  }
);

// Obtenir un paramètre par sa clé (Admin seulement)
export const getSettingByKey = asyncHandler(
  async (req: Request, res: Response) => {
    const { key } = req.params;

    const setting = await prisma.setting.findUnique({
      where: { key: key },
    });

    if (!setting) {
      return res.status(404).json({ message: "Paramètre introuvable." });
    }

    res.status(200).json(serializeBigInt(setting));
  }
);

// Mettre à jour un paramètre par sa clé (Admin seulement)
export const updateSettingByKey = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value, description } = req.body;

    const existingSetting = await prisma.setting.findUnique({
      where: { key: key },
    });

    if (!existingSetting) {
      return res.status(404).json({ message: "Paramètre introuvable." });
    }

    const updateData: any = {};
    if (value !== undefined) updateData.value = value;
    if (description !== undefined) updateData.description = description;

    const updatedSetting = await prisma.setting.update({
      where: { key: key },
      data: updateData,
    });

    res.status(200).json({
      message: "Paramètre mis à jour avec succès.",
      setting: serializeBigInt(updatedSetting),
    });
  }
);

// Supprimer un paramètre par sa clé (Admin seulement)
export const deleteSettingByKey = asyncHandler(
  async (req: Request, res: Response) => {
    const { key } = req.params;

    const existingSetting = await prisma.setting.findUnique({
      where: { key: key },
    });

    if (!existingSetting) {
      return res.status(404).json({ message: "Paramètre introuvable." });
    }

    await prisma.setting.delete({
      where: { key: key },
    });

    res.status(200).json({ message: "Paramètre supprimé avec succès." });
  }
);
