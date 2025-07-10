import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createMeetingAttendance,
  getAllMeetingAttendances,
  getMeetingAttendance,
  updateMeetingAttendance,
  deleteMeetingAttendance,
} from "../controllers/meetingAttendanceController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour la création et la mise à jour des assiduités
const meetingAttendanceValidationRules = [
  body("meetingId")
    .exists()
    .withMessage("L'ID de la réunion est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID de la réunion doit être un entier positif.")
    .toInt(),
  body("userId")
    .exists()
    .withMessage("L'ID utilisateur est requis.")
    .isInt({ gt: 0 })
    .withMessage("L'ID utilisateur doit être un entier positif.")
    .toInt(),
  body("attendanceStatus")
    .exists()
    .withMessage("Le statut d'assiduité est requis.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Le statut ne peut pas être vide.")
    .isIn(["present", "absent", "excused"])
    .withMessage("Statut invalide. Valide: present, absent, excused."),
  body("excuseReason")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage(
      "La raison de l'excuse doit être une chaîne de caractères ou null."
    ),
];

// Routes MeetingAttendance (utiliser les IDs dans les paramètres pour les opérations sur une entrée spécifique)
router.post(
  "/",
  protect,
  meetingAttendanceValidationRules,
  createMeetingAttendance
);
router.get(
  "/",
  protect,
  [
    query("meetingId").optional().isInt({ gt: 0 }).toInt(),
    query("userId").optional().isInt({ gt: 0 }).toInt(),
    query("status").optional().isString().trim(),
  ],
  getAllMeetingAttendances
);
// Pour la récupération, la mise à jour et la suppression d'une entrée spécifique, on utilise les clés composées
router.get("/:meetingId/:userId", protect, getMeetingAttendance);
router.put(
  "/:meetingId/:userId",
  protect,
  meetingAttendanceValidationRules,
  updateMeetingAttendance
);
router.delete(
  "/:meetingId/:userId",
  protect,
  authorizeAdmin,
  deleteMeetingAttendance
); // Suppression par admin

export default router;
