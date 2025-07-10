import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createFundTransaction,
  getAllFundTransactions,
  getFundTransactionById,
  updateFundTransaction,
  deleteFundTransaction,
} from "../controllers/fundTransactionController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Validation pour la création et la mise à jour des transactions de fonds
const fundTransactionValidationRules = [
  body("transactionType")
    .exists()
    .withMessage("Le type de transaction est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le type de transaction ne peut pas être vide.")
    .isIn(["credit", "debit"])
    .withMessage('Le type de transaction doit être "credit" ou "debit".'),
  body("amount")
    .exists()
    .withMessage("Le montant est requis.")
    .isFloat({ gt: 0 })
    .withMessage("Le montant doit être un nombre positif."),
  body("description")
    .optional()
    .isString()
    .trim()
    .withMessage("La description doit être une chaîne de caractères."),
  body("transactionDate")
    .exists()
    .withMessage("La date de transaction est requise.")
    .isISO8601()
    .toDate()
    .withMessage(
      "La date de transaction doit être au format ISO 8601 (YYYY-MM-DD)."
    ),
  body("monthlyContributionId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("monthlyContributionId doit être un entier positif ou null.")
    .toInt(),
  body("eventContributionId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("eventContributionId doit être un entier positif ou null.")
    .toInt(),
  body("assistanceRequestId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("assistanceRequestId doit être un entier positif ou null.")
    .toInt(),
  body("balanceAfter")
    .exists()
    .withMessage("Le solde après transaction est requis.")
    .isFloat()
    .withMessage("Le solde après transaction doit être un nombre."),
  body("createdById")
    .exists()
    .withMessage("L'ID de l'administrateur créateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("createdById doit être un entier positif.")
    .toInt(),
];

// Routes FundTransaction
router.post(
  "/",
  protect,
  authorizeAdmin,
  fundTransactionValidationRules,
  createFundTransaction
);
router.get(
  "/",
  protect,
  authorizeAdmin, // Seul l'admin peut voir toutes les transactions de fonds
  [
    query("transactionType").optional().isString().trim(),
    query("createdById").optional().isInt({ gt: 0 }).toInt(),
    query("monthlyContributionId").optional().isInt({ gt: 0 }).toInt(),
    query("eventContributionId").optional().isInt({ gt: 0 }).toInt(),
    query("assistanceRequestId").optional().isInt({ gt: 0 }).toInt(),
  ],
  getAllFundTransactions
);
router.get("/:id", protect, authorizeAdmin, getFundTransactionById);
router.put(
  "/:id",
  protect,
  authorizeAdmin,
  fundTransactionValidationRules,
  updateFundTransaction
);
router.delete("/:id", protect, authorizeAdmin, deleteFundTransaction);

export default router;
