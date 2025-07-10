import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"; // Correct import for runtime errors
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

interface CustomError extends Error {
  statusCode?: number;
  code?: string; // For Prisma errors
  meta?: { [key: string]: any }; // For Prisma errors
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Une erreur inattendue est survenue.";

  // Log the error for debugging purposes (important in production)
  console.error(err);

  // Gérer les erreurs spécifiques
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = 409; // Conflict
        message = `La ressource existe déjà avec la valeur unique fournie: ${err.meta?.target}`;
        break;
      case "P2025": // Record not found for unique constraint
        statusCode = 404; // Not Found
        message = err.meta?.cause
          ? err.meta.cause.toString()
          : "Ressource introuvable.";
        break;
      case "P2003": // Foreign key constraint violation
        statusCode = 400; // Bad Request
        message = `Violation de contrainte de clé étrangère: ${
          err.meta?.field_name ||
          "Une relation requise est manquante ou invalide."
        }`;
        break;
      // Add more Prisma error codes as needed
      default:
        statusCode = 500;
        message = `Erreur de base de données (code ${err.code}).`;
        break;
    }
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401; // Unauthorized
    message = "Token invalide. Veuillez vous reconnecter.";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401; // Unauthorized
    message = "Token expiré. Veuillez vous reconnecter.";
  }
  // Ajoutez d'autres types d'erreurs personnalisées ou de librairies ici
  // Exemple si vous avez des erreurs de validation Joi ou Yup ailleurs :
  // else if (err instanceof Joi.ValidationError) {
  //   statusCode = 400;
  //   message = err.details.map(d => d.message).join(', ');
  // }

  // Ne pas envoyer de stack trace en production pour des raisons de sécurité
  const responseBody = {
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // N'envoyer le stack trace qu'en dev
  };

  res.status(statusCode).json(responseBody);
};

export default errorHandler;
