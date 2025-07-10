import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createFamilyMeeting,
  getAllFamilyMeetings,
  getFamilyMeetingById,
  updateFamilyMeeting,
  deleteFamilyMeeting,
} from "../controllers/familyMeetingController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création et la mise à jour des réunions
const familyMeetingValidationRules = [
  body("title")
    .exists()
    .withMessage("Le titre de la réunion est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le titre ne peut pas être vide.")
    .isLength({ min: 3, max: 255 })
    .withMessage("Le titre doit contenir entre 3 et 255 caractères."),
  body("description")
    .optional()
    .isString()
    .trim()
    .withMessage("La description doit être une chaîne de caractères."),
  body("meetingDate")
    .exists()
    .withMessage("La date de la réunion est requise.")
    .isISO8601()
    .toDate()
    .withMessage(
      "La date de la réunion doit être au format ISO 8601 (YYYY-MM-DD)."
    ),
  body("location")
    .exists()
    .withMessage("Le lieu de la réunion est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le lieu ne peut pas être vide.")
    .isLength({ min: 3, max: 255 })
    .withMessage("Le lieu doit contenir entre 3 et 255 caractères."),
  body("startTime")
    .exists()
    .withMessage("L'heure de début est requise.")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("L'heure de début doit être au format HH:MM."),
  body("endTime")
    .optional({ nullable: true })
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("L'heure de fin doit être au format HH:MM ou null."),
  body("createdById")
    .exists()
    .withMessage("L'ID de l'administrateur créateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("createdById doit être un entier positif.")
    .toInt(),
];

// Routes FamilyMeeting
router.post(
  "/",
  protect,
  authorizeAdmin,
  familyMeetingValidationRules,
  createFamilyMeeting
);
router.get(
  "/",
  protect,
  [
    query("fromDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("fromDate doit être au format ISO 8601."),
    query("toDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("toDate doit être au format ISO 8601."),
  ],
  getAllFamilyMeetings
);
router.get("/:id", protect, getFamilyMeetingById);
router.put(
  "/:id",
  protect,
  authorizeAdmin,
  familyMeetingValidationRules,
  updateFamilyMeeting
);
router.delete("/:id", protect, authorizeAdmin, deleteFamilyMeeting);

export default router;
