import swaggerJSDoc from "swagger-jsdoc";
import "./docs/profile.docs";
import "./docs/memberCategory.docs";
import "./docs/memberCategoryUser.docs.ts";
import "./docs/monthlyContribution.docs";
import "./docs/eventType.docs";
import "./docs/event.docs";
import "./docs/eventContribution.docs";
import "./docs/assistanceRequest.docs";
import "./docs/fundTransaction.docs";
import "./docs/sanction.docs";
import "./docs/familyMeeting.docs";
import "./docs/meetingAttendance.docs";
import "./docs/notification.docs";
import "./docs/setting.docs";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API Cotisation Familiale",
    version: "1.0.0",
    description: "Documentation Swagger de l’API Express + Prisma",
  },
  servers: [
    {
      url: "https://famcotiapi.onrender.com/api-docs/",
      description: "Serveur local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
          isAdmin: { type: "boolean" },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ["./src/docs/**/*.ts"], // ou le chemin où tu as mis les commentaires @swagger
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
