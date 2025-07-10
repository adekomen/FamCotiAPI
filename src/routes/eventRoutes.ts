// src/routes/eventRoutes.ts

import { Router } from "express";
import { body, param } from "express-validator";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";

const router = Router();

// Validation pour la création et la mise à jour d'un événement
const eventValidation = [
  body("title").notEmpty().withMessage("Le titre de l'événement est requis."),
  body("startDate")
    .notEmpty()
    .withMessage("La date de début de l'événement est requise.")
    .isISO8601()
    .toDate()
    .withMessage(
      "La date de début de l'événement doit être une date valide (YYYY-MM-DD)."
    ),
  body("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage(
      "La date de fin de l'événement doit être une date valide (YYYY-MM-DD)."
    ),
  body("location").notEmpty().withMessage("Le lieu de l'événement est requis."),
  body("eventTypeId")
    .notEmpty()
    .withMessage("Le type d'événement est requis.")
    .isNumeric()
    .withMessage("L'ID du type d'événement doit être un nombre valide."),
  body("description")
    .optional()
    .isString()
    .withMessage("La description doit être une chaîne de caractères."),
  body("concernedUserId")
    .optional()
    .isNumeric()
    .withMessage("L'ID de l'utilisateur concerné doit être un nombre valide."),
  body("isPrivate")
    .optional()
    .isBoolean()
    .withMessage("isPrivate doit être un booléen."),
  body("isRecurring")
    .optional()
    .isBoolean()
    .withMessage("isRecurring doit être un booléen."),
  body("recurrencePattern")
    .optional()
    .isString()
    .withMessage("Le motif de récurrence doit être une chaîne de caractères."),
];

// Validation pour l'ID dans les paramètres
const eventIdParamValidation = [
  param("id")
    .isNumeric()
    .withMessage("L'ID de l'événement doit être un nombre valide."),
];

// Routes pour les événements
// CREATE (Authentification requise)
router.post(
  "/",
  protect, // C'est ici que l'erreur est signalée à cause du type de retour
  eventValidation,
  createEvent
);

// READ ALL (Authentification requise)
router.get(
  "/",
  protect, // C'est ici que l'erreur est signalée à cause du type de retour
  getAllEvents
);

// READ ONE (Authentification requise)
router.get(
  "/:id",
  protect, // C'est ici que l'erreur est signalée à cause du type de retour
  eventIdParamValidation,
  getEventById
);

// UPDATE (Admin ou créateur de l'événement)
router.put(
  "/:id",
  protect, // C'est ici que l'erreur est signalée à cause du type de retour
  eventIdParamValidation,
  eventValidation,
  updateEvent
);

// DELETE (Admin ou créateur de l'événement)
router.delete(
  "/:id",
  protect, // C'est ici que l'erreur est signalée à cause du type de retour
  eventIdParamValidation,
  deleteEvent
);

export default router;
