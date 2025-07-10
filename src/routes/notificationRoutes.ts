import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/notificationController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création de notifications
const createNotificationRules = [
  body("type")
    .exists()
    .withMessage("Le type de notification est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le type ne peut pas être vide."),
  body("notifiableType")
    .exists()
    .withMessage("Le type de l'entité notifiable est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le type de notifiable ne peut pas être vide."),
  body("notifiableId")
    .exists()
    .withMessage("L'ID de l'entité notifiable est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID notifiable doit être un entier positif.")
    .toInt(),
  body("data")
    .exists()
    .withMessage("Les données de la notification sont requises.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Les données ne peuvent pas être vides."),
];

// Routes Notification
router.post(
  "/",
  protect,
  authorizeAdmin,
  createNotificationRules,
  createNotification
); // Admin seulement (généralement)
router.get(
  "/",
  protect,
  [
    query("type").optional().isString().trim(),
    query("notifiableType").optional().isString().trim(),
    query("notifiableId").optional().isInt({ gt: 0 }).toInt(),
    query("read")
      .optional()
      .isBoolean()
      .withMessage("Le filtre read doit être un booléen (true/false)")
      .toBoolean(),
  ],
  getAllNotifications
);
router.get("/:id", protect, getNotificationById);
router.put("/:id/read", protect, markNotificationAsRead); // Marquer comme lue
router.delete("/:id", protect, authorizeAdmin, deleteNotification); // Admin seulement

export default router;
