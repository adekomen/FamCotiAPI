import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  assignUserToCategory,
  getAllUserCategoryAssignments,
  getUserCategoryAssignment,
  unassignUserFromCategory,
} from "../controllers/memberCategoryUserController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Validation pour l'assignation
const assignUserToCategoryRules = [
  body("userId")
    .exists()
    .withMessage("L'ID utilisateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID utilisateur doit être un entier positif.")
    .toInt(),
  body("categoryId")
    .exists()
    .withMessage("L'ID de la catégorie est requise.")
    .isInt({ gt: 0 })
    .withMessage("L'ID de la catégorie doit être un entier positif.")
    .toInt(),
];

// Routes MemberCategoryUser
router.post(
  "/",
  protect,
  authorizeAdmin,
  assignUserToCategoryRules,
  assignUserToCategory
); // Admin seulement
router.get(
  "/",
  protect,
  authorizeAdmin, // Seul l'admin peut voir toutes les assignations
  [
    query("userId").optional().isInt({ gt: 0 }).toInt(),
    query("categoryId").optional().isInt({ gt: 0 }).toInt(),
  ],
  getAllUserCategoryAssignments
);
// Pour la récupération et la suppression par clés primaires composées, on utilise les paramètres d'URL
router.get(
  "/:userId/:categoryId",
  protect,
  authorizeAdmin,
  getUserCategoryAssignment
); // Admin seulement
router.delete(
  "/:userId/:categoryId",
  protect,
  authorizeAdmin,
  unassignUserFromCategory
); // Admin seulement

export default router;
