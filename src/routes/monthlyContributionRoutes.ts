import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createMonthlyContribution,
  getAllMonthlyContributions,
  getMonthlyContributionById,
  updateMonthlyContribution,
  deleteMonthlyContribution,
} from "../controllers/monthlyContributionController";
import { protect, authorizeAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création et la mise à jour
const monthlyContributionValidationRules = [
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
  body("month")
    .exists()
    .withMessage("Le mois est requis.")
    .isInt({ min: 1, max: 12 })
    .withMessage("Le mois doit être un entier entre 1 et 12."),
  body("year")
    .exists()
    .withMessage("L'année est requise.")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("L'année doit être un entier valide (ex: 2024)."),
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

// Routes pour les contributions mensuelles
router.post(
  "/",
  protect,
  monthlyContributionValidationRules,
  createMonthlyContribution
);
router.get(
  "/",
  protect,
  [
    query("userId")
      .optional()
      .isInt({ gt: 0 })
      .withMessage("userId doit être un entier positif.")
      .toInt(),
    query("month")
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage("month doit être un entier entre 1 et 12.")
      .toInt(),
    query("year")
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage("year doit être un entier valide.")
      .toInt(),
  ],
  getAllMonthlyContributions
);
router.get("/:id", protect, getMonthlyContributionById);
router.put(
  "/:id",
  protect,
  monthlyContributionValidationRules,
  updateMonthlyContribution
);
router.delete("/:id", protect, deleteMonthlyContribution);

export default router;
