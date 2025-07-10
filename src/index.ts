import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import memberCategoryRoutes from "./routes/memberCategoryRoutes";
import profileRoutes from "./routes/profileRoutes";
import eventTypeRoutes from "./routes/eventTypeRoutes";
import eventRoutes from "./routes/eventRoutes";
import monthlyContributionRoutes from "./routes/monthlyContributionRoutes";
import fundTransactionRoutes from "./routes/fundTransactionRoutes";
import eventContributionRoutes from "./routes/eventContributionRoutes";
import assistanceRequestRoutes from "./routes/assistanceRequestRoutes";
import memberCategoryUserRoutes from "./routes/memberCategoryUserRoutes";
import sanctionRoutes from "./routes/sanctionRoutes";
import familyMeetingRoutes from "./routes/familyMeetingRoutes";
import meetingAttendanceRoutes from "./routes/meetingAttendanceRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import settingRoutes from "./routes/settingRoutes";

import errorHandler from "./middlewares/errorHandler";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";

dotenv.config();

const app: Application = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("API is running smoothly! 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/member-categories", memberCategoryRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/monthly-contributions", monthlyContributionRoutes);
app.use("/api/fund-transactions", fundTransactionRoutes);
app.use("/api/event-contributions", eventContributionRoutes);
app.use("/api/assistance-requests", assistanceRequestRoutes);
app.use("/api/member-category-users", memberCategoryUserRoutes);
app.use("/api/sanctions", sanctionRoutes);
app.use("/api/family-meetings", familyMeetingRoutes);
app.use("/api/meeting-attendances", meetingAttendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export default app;

export { prisma };
