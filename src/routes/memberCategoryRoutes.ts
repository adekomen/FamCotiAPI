import { Router } from "express";
import { body, param } from "express-validator";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";
import {
  createMemberCategory,
  getMemberCategories,
  getMemberCategoryById,
  updateMemberCategory,
  deleteMemberCategory,
} from "../controllers/memberCategoryController";

const router = Router();

// Validation pour la création et la mise à jour d'une catégorie
const categoryValidation = [
  body("name").notEmpty().withMessage("Le nom de la catégorie est requis."),
  body("monthlyContributionAmount")
    .isFloat({ min: 0 })
    .withMessage(
      "Le montant de la contribution mensuelle doit être un nombre positif."
    ),
  // description est optionnelle, pas besoin de validation notEmpty
];

// Routes pour les catégories de membres
router.post(
  "/",
  protect, // Nécessite un token valide
  authorizeAdmin, // Nécessite que l'utilisateur soit admin
  categoryValidation, // Valide les données d'entrée
  createMemberCategory
);

router.get(
  "/",
  protect, // Nécessite un token valide
  getMemberCategories
);

router.get(
  "/:id",
  protect, // Nécessite un token valide
  param("id")
    .isNumeric()
    .withMessage("L'ID de la catégorie doit être un nombre."), // Validation de l'ID
  getMemberCategoryById
);

router.put(
  "/:id",
  protect, // Nécessite un token valide
  authorizeAdmin, // Nécessite que l'utilisateur soit admin
  param("id")
    .isNumeric()
    .withMessage("L'ID de la catégorie doit être un nombre."),
  categoryValidation, // Valide les données mises à jour
  updateMemberCategory
);

router.delete(
  "/:id",
  protect, // Nécessite un token valide
  authorizeAdmin, // Nécessite que l'utilisateur soit admin
  param("id")
    .isNumeric()
    .withMessage("L'ID de la catégorie doit être un nombre."),
  deleteMemberCategory
);

export default router;
