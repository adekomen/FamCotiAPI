import { Request, Response, NextFunction } from "express";

// Ce wrapper gère les erreurs asynchrones pour éviter d'avoir à utiliser des blocs try-catch dans chaque contrôleur.
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
