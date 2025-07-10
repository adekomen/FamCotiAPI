import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../utils/asyncHandler";

const prisma = new PrismaClient();

// Étendre l'interface Request d'Express pour ajouter des propriétés personnalisées
// Assurez-vous que cette déclaration est globale, par exemple dans un fichier d.ts
// ou au début de ce fichier.
declare global {
  namespace Express {
    interface Request {
      userId?: bigint; // userId sera un BigInt car Prisma utilise BigInt
      isAdmin?: boolean;
    }
  }
}

interface JwtPayload {
  userId: number; // L'ID est stocké comme un nombre dans le JWT
  email: string;
  isAdmin: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Assurez-vous que ce secret correspond à celui dans authController

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Vérifier si le token est présent dans les headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Extraire le token
        token = req.headers.authorization.split(" ")[1];

        // Vérifier le token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Assurez-vous que l'ID est un BigInt avant de le stocker ou de l'utiliser avec Prisma
        // Si votre ID Prisma est BigInt, convertissez-le ici.
        req.userId = BigInt(decoded.userId); // <--- C'EST LA LIGNE CLÉ À VÉRIFIER/AJOUTER
        req.isAdmin = decoded.isAdmin;

        // Rechercher l'utilisateur dans la base de données
        // Utilisez le BigInt userId pour la recherche Prisma
        const user = await prisma.user.findUnique({
          where: {
            id: req.userId, // Utilisez req.userId qui est maintenant un BigInt
          },
        });

        if (!user) {
          res.status(401);
          throw new Error("Non autorisé, utilisateur non trouvé.");
        }

        // Si tout est bon, passer au middleware ou au contrôleur suivant
        next();
      } catch (error: any) {
        console.error(error); // Log the actual error for debugging
        if (error.name === "TokenExpiredError") {
          res.status(401);
          throw new Error("Non autorisé, token expiré.");
        } else if (error.name === "JsonWebTokenError") {
          res.status(401);
          throw new Error("Non autorisé, token invalide.");
        } else {
          res.status(401);
          throw new Error("Non autorisé, échec de la vérification du token.");
        }
      }
    } else {
      res.status(401);
      throw new Error("Non autorisé, aucun token fourni.");
    }
  }
);

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAdmin) {
    res
      .status(403)
      .json({ message: "Accès interdit. Réservé aux administrateurs." });
    return;
  }
  next();
};
