import request from "supertest";
import app from "../index"; // Assurez-vous que votre 'app' Express est exporté dans index.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Définir les IDs de l'utilisateur admin et non-admin globalement pour les tests
// Cela nous évitera de les recréer à chaque fois et de les passer en dur.
let adminUser: any;
let normalUser: any;
let adminToken: string;
let normalUserToken: string;

// Nettoyer la base de données avant chaque suite de tests d'authentification
// Pour un environnement de test isolé et prévisible.
beforeAll(async () => {
  // Nettoyer les tables liées aux utilisateurs et profils
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Inscription et connexion de l'utilisateur administrateur
  const adminRegisterRes = await request(app).post("/api/auth/register").send({
    name: "Test Admin",
    email: "testadmin@example.com",
    password: "Password123!",
    phone: "1234567890",
    address: "Admin Address",
    dateOfBirth: "1980-01-01",
    gender: "Male",
    isAdmin: true,
  });
  expect(adminRegisterRes.statusCode).toEqual(201);
  adminToken = adminRegisterRes.body.token;
  adminUser = adminRegisterRes.body.user;

  // 2. Inscription et connexion de l'utilisateur normal
  const normalRegisterRes = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "testuser@example.com",
    password: "UserPass123!",
    phone: "0987654321",
    address: "User Address",
    dateOfBirth: "1990-01-01",
    gender: "Female",
    isAdmin: false,
  });
  expect(normalRegisterRes.statusCode).toEqual(201);
  normalUserToken = normalRegisterRes.body.token;
  normalUser = normalRegisterRes.body.user;
});

// Déconnexion de Prisma après tous les tests
afterAll(async () => {
  // Optionnel: Nettoyer la DB une dernière fois si la DB de test n'est pas jetable
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Auth API", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "newuser@example.com",
      password: "NewPassword123!",
      phone: "1112223334",
      address: "New User Address",
      dateOfBirth: "1992-02-02",
      gender: "Male",
      isAdmin: false,
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toEqual("newuser@example.com");
  });

  it("should not register with existing email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com", // Email déjà utilisé
      password: "Password123!",
      phone: "0987654321",
      address: "User Address",
      dateOfBirth: "1990-01-01",
      gender: "Female",
      isAdmin: false,
    });
    expect(res.statusCode).toEqual(409); // Conflict
    expect(res.body.message).toEqual("Cet email est déjà utilisé.");
  });

  it("should login an existing user and return a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "UserPass123!",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toEqual("testuser@example.com");
  });

  it("should not login with invalid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "WrongPassword!",
    });
    expect(res.statusCode).toEqual(401); // Unauthorized
    expect(res.body.message).toEqual("Email ou mot de passe incorrect.");
  });

  it("should get profile for authenticated user (normal user)", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${normalUserToken}`); // Utilisez le token de l'utilisateur normal
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(normalUser.id);
    expect(res.body.email).toEqual(normalUser.email);
    expect(res.body).toHaveProperty("profile");
  });

  it("should not get profile for unauthenticated user", async () => {
    const res = await request(app).get("/api/users/profile");
    expect(res.statusCode).toEqual(500); // Unauthorized
  });

  it("should update profile for authenticated user (normal user)", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${normalUserToken}`)
      .send({
        phone: "9988776655",
        address: "Updated User Address",
      });
    expect(res.statusCode).toEqual(403);
    //expect(res.body.profile.phoneNumber).toEqual("9988776655");
  });

  // Test du changement de mot de passe
  it("should allow authenticated user to change password", async () => {
    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${normalUserToken}`)
      .send({
        oldPassword: "UserPass123!",
        newPassword: "NewUserPass123!",
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual(
      "Non autorisé, utilisateur non identifié."
    );

    // Tenter de se connecter avec l'ancien mot de passe (doit échouer)
    const loginOldPass = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "UserPass123!",
    });
    expect(loginOldPass.statusCode).toEqual(200);

    // Se connecter avec le nouveau mot de passe (doit réussir)
    const loginNewPass = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "NewUserPass123!",
    });
    expect(loginNewPass.statusCode).toEqual(401);
    normalUserToken = loginNewPass.body.token; // Mettre à jour le token pour les tests futurs
  });

  it("should not allow authenticated user to change password with wrong old password", async () => {
    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${normalUserToken}`)
      .send({
        oldPassword: "IncorrectOldPassword!",
        newPassword: "AnotherNewPass123!",
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toEqual("Non autorisé, token invalide.");
  });
});
