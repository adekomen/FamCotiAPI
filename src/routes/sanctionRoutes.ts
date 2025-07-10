import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createSanction,
  getAllSanctions,
  getSanctionById,
  updateSanction,
  deleteSanction,
} from "../controllers/sanctionController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création et la mise à jour des sanctions
const sanctionValidationRules = [
  body("userId")
    .exists()
    .withMessage("L'ID de l'utilisateur sanctionné est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID utilisateur doit être un entier positif.")
    .toInt(),
  body("reason")
    .exists()
    .withMessage("La raison de la sanction est requise.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("La raison ne peut pas être vide.")
    .isLength({ min: 10, max: 500 })
    .withMessage("La raison doit contenir entre 10 et 500 caractères."),
  body("startDate")
    .exists()
    .withMessage("La date de début de la sanction est requise.")
    .isISO8601()
    .toDate()
    .withMessage("La date de début doit être au format ISO 8601 (YYYY-MM-DD)."),
  body("endDate")
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage("La date de fin doit être au format ISO 8601 ou null."),
  body("resolvedAt")
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage("La date de résolution doit être au format ISO 8601 ou null."),
  body("resolvedById")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage(
      "L'ID de l'utilisateur qui a résolu doit être un entier positif ou null."
    )
    .toInt(),
  body("resolutionNotes")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage(
      "Les notes de résolution doivent être une chaîne de caractères ou null."
    ),
  body("createdById")
    .exists()
    .withMessage("L'ID de l'administrateur créateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("createdById doit être un entier positif.")
    .toInt(),
];

// Routes Sanction
router.post(
  "/",
  protect,
  authorizeAdmin,
  sanctionValidationRules,
  createSanction
);
router.get(
  "/",
  protect,
  [
    query("userId").optional().isInt({ gt: 0 }).toInt(),
    query("resolved")
      .optional()
      .isBoolean()
      .withMessage("Le filtre resolved doit être un booléen (true/false)")
      .toBoolean(),
  ],
  getAllSanctions
);
router.get("/:id", protect, getSanctionById);
router.put(
  "/:id",
  protect,
  authorizeAdmin,
  sanctionValidationRules,
  updateSanction
);
router.delete("/:id", protect, authorizeAdmin, deleteSanction);

export default router;
