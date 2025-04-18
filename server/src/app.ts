import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import companyDetailsRoutes from "./routes/companyDetails.routes";
import { errorHandler } from "./utils/errorHandler";
import authRoutes from "./routes/auth.routes";
import { cookieAuthMiddleware } from "./middleware/cookieAuth.middleware";

const app: Express = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/company-details", cookieAuthMiddleware, companyDetailsRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
	res.json({ status: "ok" });
});

// Use the custom error handler
app.use(errorHandler);

export default app;
