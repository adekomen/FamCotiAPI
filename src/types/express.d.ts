import { Request } from "express";
import { Prisma } from "@prisma/client"; // Importez Prisma pour Decimal et bigint

// Déclarez le module 'express' pour étendre son interface Request
declare module "express" {
  export interface Request {
    // userId et isAdmin sont attachés par authenticateToken
    userId?: Prisma.Decimal | bigint; // Prisma gère BigInt comme Decimal, donc les deux sont valides.
    // Si votre JWT le parse directement en JS bigint, utilisez 'bigint'.
    // Le plus sûr est de caster BigInt(payload.userId) comme fait.
    isAdmin?: boolean;
    // L'objet 'user' complet, si vous le préférez pour un accès direct
    user?: {
      id: bigint; // L'ID de l'utilisateur stocké en BigInt
      email: string;
      isAdmin: boolean;
      // Ajoutez d'autres propriétés de l'utilisateur si vous les attachez à req.user dans votre JWT
    };
  }
}
