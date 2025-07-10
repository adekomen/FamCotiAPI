import { Router } from "express";
import { body, param } from "express-validator";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";
import {
  createEventType,
  getAllEventTypes,
  getEventTypeById,
  updateEventType,
  deleteEventType,
} from "../controllers/eventTypeController";

const router = Router();

// Validation pour la création et la mise à jour d'un type d'événement
const eventTypeValidation = [
  body("name").notEmpty().withMessage("Le nom du type d'événement est requis."),
  body("description")
    .optional()
    .isString()
    .withMessage("La description doit être une chaîne de caractères."),
  body("isHappyEvent")
    .optional()
    .isBoolean()
    .withMessage("isHappyEvent doit être un booléen."),
];

// Validation pour l'ID dans les paramètres
const eventTypeIdParamValidation = [
  param("id")
    .isNumeric()
    .withMessage("L'ID du type d'événement doit être un nombre valide."),
];

// Routes pour les types d'événements
// CREATE (Admin seulement)
router.post(
  "/",
  protect,
  authorizeAdmin,
  eventTypeValidation,
  createEventType
);

// READ ALL (Authentification requise)
router.get("/", protect, getAllEventTypes);

// READ ONE (Authentification requise)
router.get(
  "/:id",
  protect,
  eventTypeIdParamValidation,
  getEventTypeById
);

// UPDATE (Admin seulement)
router.put(
  "/:id",
  protect,
  authorizeAdmin,
  eventTypeIdParamValidation,
  eventTypeValidation,
  updateEventType
);

// DELETE (Admin seulement, avec vérification des événements liés)
router.delete(
  "/:id",
  protect,
  authorizeAdmin,
  eventTypeIdParamValidation,
  deleteEventType
);

export default router;
