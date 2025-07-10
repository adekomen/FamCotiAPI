import { Router } from "express";
import { param, body } from "express-validator";
import { protect, authorizeAdmin } from "../middlewares/authMiddleware";
import {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = Router();

const userIdParamValidation = [
  param("id")
    .isNumeric()
    .withMessage("L'ID de l'utilisateur doit être un nombre valide."),
];

const userUpdateValidation = [
  body("name")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Le nom doit être une chaîne de caractères non vide."),
  body("email")
    .optional()
    .isEmail()
    .withMessage("L'email doit être un format valide."),
  body("isAdmin")
    .optional()
    .isBoolean()
    .withMessage("isAdmin doit être un booléen."),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive doit être un booléen."),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit avoir au moins 6 caractères."),
];

router.get("/profile", protect, getUserProfile);

router.get("/", protect, authorizeAdmin, getAllUsers);

router.get(
  "/:id",
  protect,
  authorizeAdmin,
  userIdParamValidation,
  getUserById
);

router.put(
  "/:id",
  protect,
  authorizeAdmin,
  userIdParamValidation,
  userUpdateValidation,
  updateUser
);

router.delete(
  "/:id",
  protect,
  authorizeAdmin,
  userIdParamValidation,
  deleteUser
);

export default router;
