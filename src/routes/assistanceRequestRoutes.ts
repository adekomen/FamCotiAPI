import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createAssistanceRequest,
  getAllAssistanceRequests,
  getAssistanceRequestById,
  updateAssistanceRequest,
  deleteAssistanceRequest,
} from "../controllers/assistanceRequestController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création et la mise à jour
const assistanceRequestValidationRules = [
  body("userId")
    .exists()
    .withMessage("L'ID utilisateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID utilisateur doit être un entier positif.")
    .toInt(),
  body("eventId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("L'ID de l'événement doit être un entier positif ou null.")
    .toInt(),
  body("title")
    .exists()
    .withMessage("Le titre de la demande est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le titre ne peut pas être vide.")
    .isLength({ min: 3, max: 255 })
    .withMessage("Le titre doit contenir entre 3 et 255 caractères."),
  body("description")
    .exists()
    .withMessage("La description de la demande est requise.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("La description ne peut pas être vide."),
  body("amountRequested")
    .exists()
    .withMessage("Le montant demandé est requis.")
    .isFloat({ gt: 0 })
    .withMessage("Le montant demandé doit être un nombre positif."),
  body("status")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le statut ne peut pas être vide.")
    .isIn(["pending", "approved", "rejected", "paid"])
    .withMessage("Statut invalide. Valide: pending, approved, rejected, paid."),
  body("approvedAmount")
    .optional({ nullable: true })
    .isFloat({ gt: 0 })
    .withMessage("Le montant approuvé doit être un nombre positif ou null."),
  body("approvalDate")
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage("La date d'approbation doit être au format ISO 8601 ou null."),
  body("paymentDate")
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage("La date de paiement doit être au format ISO 8601 ou null."),
  body("rejectedReason")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage(
      "La raison du rejet doit être une chaîne de caractères ou null."
    ),
];

// Routes AssistanceRequest
router.post(
  "/",
  protect,
  assistanceRequestValidationRules,
  createAssistanceRequest
);
router.get(
  "/",
  protect,
  [
    query("userId").optional().isInt({ gt: 0 }).toInt(),
    query("eventId").optional().isInt({ gt: 0 }).toInt(),
    query("status").optional().isString().trim(),
  ],
  getAllAssistanceRequests
);
router.get("/:id", protect, getAssistanceRequestById);
router.put(
  "/:id",
  protect,
  assistanceRequestValidationRules,
  updateAssistanceRequest
);
router.delete("/:id", protect, deleteAssistanceRequest);

export default router;
