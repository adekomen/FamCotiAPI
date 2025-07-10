import { Router } from "express";
import { body, param } from "express-validator";
import {
  createSetting,
  getAllSettings,
  getSettingByKey,
  updateSettingByKey,
  deleteSettingByKey,
} from "../controllers/settingController";
import {
  protect,
  authorizeAdmin,
} from "../middlewares/authMiddleware";

const router = Router();

// Règles de validation pour les paramètres
const settingValidationRules = [
  body("key")
    .exists()
    .withMessage("La clé du paramètre est requise.")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("La clé ne peut pas être vide.")
    .isLength({ min: 2, max: 100 })
    .withMessage("La clé doit contenir entre 2 et 100 caractères."),
  body("value")
    .optional({ nullable: true }) // Value can be null for some settings
    .isString()
    .trim()
    .withMessage("La valeur doit être une chaîne de caractères."),
  body("description")
    .optional()
    .isString()
    .trim()
    .withMessage("La description doit être une chaîne de caractères."),
];

// Routes Setting
router.post(
  "/",
  protect,
  authorizeAdmin,
  settingValidationRules,
  createSetting
);
router.get("/", protect, authorizeAdmin, getAllSettings);
router.get("/:key", protect, authorizeAdmin, getSettingByKey);
router.put(
  "/:key",
  protect,
  authorizeAdmin,
  settingValidationRules,
  updateSettingByKey
);
router.delete("/:key", protect, authorizeAdmin, deleteSettingByKey);

export default router;
