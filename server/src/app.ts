import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import companyDetailsRoutes from "./routes/companyDetails.routes";
import { errorHandler } from "./utils/errorHandler";
import config from "./config/app.config";
import authRoutes from "./routes/auth.routes";
const app: Express = express();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json());

// Routes
app.use("/api/company-details", companyDetailsRoutes);
app.use("/api/user", authRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
	res.json({ status: "ok" });
});

// Use the custom error handler
app.use(errorHandler);

export default app;
