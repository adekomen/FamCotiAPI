import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, changePassword } from "../controllers/authController";
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Validation pour l'inscription
const registerValidation = [
  body('name').notEmpty().withMessage('Le nom est requis.'),
  body('email').isEmail().withMessage('Veuillez fournir un email valide.'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Veuillez fournir un email valide.'),
  body('password').notEmpty().withMessage('Le mot de passe est requis.'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.put("/change-password", protect, changePassword);

export default router;