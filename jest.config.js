/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"], // Détecte les fichiers .test.ts ou .spec.ts
  setupFilesAfterEnv: ["./jest.setup.ts"], // Pour configurer Prisma Client une fois
};
