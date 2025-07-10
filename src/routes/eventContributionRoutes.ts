import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createEventContribution,
  getAllEventContributions,
  getEventContributionById,
  updateEventContribution,
  deleteEventContribution,
} from "../controllers/eventContributionController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création et la mise à jour
const eventContributionValidationRules = [
  body("eventId")
    .exists()
    .withMessage("L'ID de l'événement est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID de l'événement doit être un entier positif.")
    .toInt(),
  body("userId")
    .exists()
    .withMessage("L'ID utilisateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID utilisateur doit être un entier positif.")
    .toInt(),
  body("amount")
    .exists()
    .withMessage("Le montant est requis.")
    .isFloat({ gt: 0 })
    .withMessage("Le montant doit être un nombre positif."),
  body("paymentDate")
    .exists()
    .withMessage("La date de paiement est requise.")
    .isISO8601()
    .toDate()
    .withMessage(
      "La date de paiement doit être au format ISO 8601 (YYYY-MM-DD)."
    ),
  body("paymentMethod")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("La méthode de paiement doit être une chaîne non vide."),
  body("transactionReference")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("La référence de transaction doit être une chaîne non vide."),
  body("notes")
    .optional()
    .isString()
    .trim()
    .withMessage("Les notes doivent être une chaîne de caractères."),
];

// Routes EventContribution
router.post(
  "/",
  protect,
  eventContributionValidationRules,
  createEventContribution
);
router.get(
  "/",
  protect,
  [
    query("eventId").optional().isInt({ gt: 0 }).toInt(),
    query("userId").optional().isInt({ gt: 0 }).toInt(),
  ],
  getAllEventContributions
);
router.get("/:id", protect, getEventContributionById);
router.put(
  "/:id",
  protect,
  eventContributionValidationRules,
  updateEventContribution
);
router.delete("/:id", protect, deleteEventContribution); // Note: Admin can delete any, user can delete their own

export default router;