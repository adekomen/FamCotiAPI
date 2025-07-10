import dotenv from "dotenv";

dotenv.config({ path: "./.env.test" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Nettoie la base de données après tous les tests si on veut un état vide
// C'est souvent mieux de faire des nettoyages plus granulaires par test ou suite.
// Pour des tests d'intégration, on peut vouloir reinitialiser une DB de test.

// Exemple simple de nettoyage si besoin, mais à adapter à votre workflow de test
// Si vous utilisez une base de données de test jetable, cette partie est moins critique.
// Pour le moment, nous allons juste nous assurer que PrismaClient est disponible.

beforeAll(async () => {
  // Optionnel: Nettoyer des tables spécifiques avant de commencer tous les tests
  // await prisma.user.deleteMany({});
  // await prisma.memberCategory.deleteMany({});
  // etc.
});

afterAll(async () => {
  await prisma.$disconnect(); // Déconnecter Prisma après tous les tests
});

// Expose Prisma Client globalement pour les tests
// Utile si vous voulez accéder directement à Prisma dans vos tests, mais attention à l'isolement.
// Pour l'intégration, on préfère tester les endpoints qui utilisent Prisma.
