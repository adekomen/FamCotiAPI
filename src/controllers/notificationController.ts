import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler";
import { serializeBigInt } from "../utils/serializeBigInt";

const prisma = new PrismaClient();

// Créer une nouvelle notification (Admin seulement, ou interne au système)
// Note: La création de notifications est souvent interne et non via une API directe par un utilisateur.
// Cependant, pour un CRUD complet, nous l'incluons.
export const createNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type, // ex: "nouvel_evenement", "sanction_appliquee", "rappel_paiement"
      notifiableType, // ex: "User", "Event", "MonthlyContribution"
      notifiableId, // ID de l'entité concernée
      data, // Données JSON de la notification (message, détails, etc.)
    } = req.body;

    // Validation supplémentaire: notifiableId doit exister pour notifiableType
    let entityExists = false;
    switch (notifiableType) {
      case "User":
        entityExists =
          (await prisma.user.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      case "Event":
        entityExists =
          (await prisma.event.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      case "MonthlyContribution":
        entityExists =
          (await prisma.monthlyContribution.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      case "EventContribution":
        entityExists =
          (await prisma.eventContribution.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      case "AssistanceRequest":
        entityExists =
          (await prisma.assistanceRequest.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      case "Sanction":
        entityExists =
          (await prisma.sanction.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      case "FamilyMeeting":
        entityExists =
          (await prisma.familyMeeting.findUnique({
            where: { id: BigInt(notifiableId) },
          })) !== null;
        break;
      // Add other notifiable types as needed
      default:
        return res
          .status(400)
          .json({ message: "Type de notifiable non supporté." });
    }

    if (!entityExists) {
      return res
        .status(404)
        .json({
          message: `L'entité notifiable de type ${notifiableType} avec l'ID ${notifiableId} est introuvable.`,
        });
    }

    const newNotification = await prisma.notification.create({
      data: {
        type,
        notifiableType,
        notifiableId: BigInt(notifiableId),
        data, // Assuming data is already a string (JSON stringified)
      },
    });

    res.status(201).json({
      message: "Notification créée avec succès.",
      notification: serializeBigInt(newNotification),
    });
  }
);

// Obtenir toutes les notifications (Admin peut tout voir, l'utilisateur voit ses notifications)
// Ici, on considère que 'notifiableType: User' et 'notifiableId: currentUserId' sont les notifications de l'utilisateur.
// Pour les autres types (Event, etc.), on pourrait vouloir des règles différentes.
export const getAllNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const isAdmin = req.isAdmin as boolean;
    const currentUserId = req.userId as bigint;

    const { type, notifiableType, notifiableId, read } = req.query;

    const whereClause: any = {};
    if (!isAdmin) {
      // Un utilisateur non-admin voit uniquement les notifications qui lui sont destinées
      // Cela suppose que les notifications destinées à un user ont notifiableType='User' et notifiableId = son ID
      whereClause.notifiableType = "User";
      whereClause.notifiableId = currentUserId;
    } else {
      // L'admin peut filtrer plus largement
      if (type) whereClause.type = type as string;
      if (notifiableType) whereClause.notifiableType = notifiableType as string;
      if (notifiableId)
        whereClause.notifiableId = BigInt(notifiableId as string);
    }

    if (read !== undefined) {
      whereClause.readAt = read === "true" ? { not: null } : null; // Filter for read (not null) or unread (null)
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(serializeBigInt(notifications));
  }
);

// Obtenir une notification par son ID (Admin ou l'utilisateur concerné)
export const getNotificationById = asyncHandler(
  async (req: Request, res: Response) => {
    const notificationId = req.params.id; // UUID
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable." });
    }

    // Permissions : Admin peut voir n'importe quelle notification.
    // Un utilisateur ne peut voir que les notifications qui lui sont directement destinées.
    if (
      !isAdmin &&
      !(
        notification.notifiableType === "User" &&
        notification.notifiableId === currentUserId
      )
    ) {
      return res
        .status(403)
        .json({ message: "Accès non autorisé à cette notification." });
    }

    res.status(200).json(serializeBigInt(notification));
  }
);

// Marquer une notification comme lue (Admin ou l'utilisateur concerné)
export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const notificationId = req.params.id;
    const currentUserId = req.userId as bigint;
    const isAdmin = req.isAdmin as boolean;

    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return res.status(404).json({ message: "Notification introuvable." });
    }

    // Permissions : Admin peut marquer n'importe quelle notification comme lue.
    // Un utilisateur ne peut marquer comme lue que les notifications qui lui sont directement destinées.
    if (
      !isAdmin &&
      !(
        existingNotification.notifiableType === "User" &&
        existingNotification.notifiableId === currentUserId
      )
    ) {
      return res
        .status(403)
        .json({
          message: "Non autorisé à marquer cette notification comme lue.",
        });
    }

    if (existingNotification.readAt) {
      return res
        .status(200)
        .json({
          message: "Notification déjà marquée comme lue.",
          notification: serializeBigInt(existingNotification),
        });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    res.status(200).json({
      message: "Notification marquée comme lue avec succès.",
      notification: serializeBigInt(updatedNotification),
    });
  }
);

// Supprimer une notification (Admin seulement)
// Note: La suppression est souvent limitée aux admins ou après une certaine période.
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const notificationId = req.params.id;
    const isAdmin = req.isAdmin as boolean;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer les notifications." });
    }

    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return res.status(404).json({ message: "Notification introuvable." });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.status(200).json({ message: "Notification supprimée avec succès." });
  }
);
