// src/routes/profileRoutes.ts

import { Router } from "express";
import { body, param } from "express-validator";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";
import { protect, authorizeAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Validation pour la création et la mise à jour des profils
const profileValidationRules = [
  body("userId")
    .optional() // L'ID utilisateur peut être fourni mais est souvent implicite pour createProfile
    .isInt({ gt: 0 }) // <-- CHANGEMENT ICI : Utiliser isInt pour les IDs entiers positifs
    .withMessage("L'ID utilisateur doit être un entier positif.")
    .toInt(), // Convertit la chaîne en nombre (utile pour la conversion BigInt)
  body("phoneNumber")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage(
      "Le numéro de téléphone doit contenir entre 8 et 20 caractères."
    ),
  body("address")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("L'adresse doit contenir entre 3 et 255 caractères."),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage(
      "La date de naissance doit être une date valide au format ISO 8601."
    ),
  body("profilePhotoPath")
    .optional()
    .isString()
    .trim()
    .isURL()
    .withMessage("Le chemin de la photo de profil doit être une URL valide."),
  body("isMarried")
    .optional()
    .isBoolean()
    .withMessage('Le statut "marié" doit être un booléen.'),
  body("isEmployed")
    .optional()
    .isBoolean()
    .withMessage('Le statut "employé" doit être un booléen.'),
  body("isCivilServant")
    .optional()
    .isBoolean()
    .withMessage('Le statut "fonctionnaire" doit être un booléen.'),
  body("parentId")
    .optional({ nullable: true }) // Permet null ou undefined
    .isInt({ gt: 0 }) // <-- CHANGEMENT ICI : Utiliser isInt pour les IDs entiers positifs
    .withMessage("L'ID du parent doit être un entier positif ou null.")
    .toInt(), // Convertit la chaîne en nombre
];

// Routes Profile
router.post("/", protect, profileValidationRules, createProfile);
router.get("/", protect, authorizeAdmin, getAllProfiles);
router.get("/:id", protect, getProfileById);
router.put("/:id", protect, profileValidationRules, updateProfile);
router.delete("/:id", protect, authorizeAdmin, deleteProfile);

export default router;
