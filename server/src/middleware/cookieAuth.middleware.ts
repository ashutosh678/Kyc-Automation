import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

export interface AuthenticatedRequest extends Request {
	user?: {
		userId: string;
		email: string;
	};
}

export const cookieAuthMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies.authToken;

	if (!token) {
		// Don't log a warning for common auth check endpoints
		if (!req.path.includes("/auth/check")) {
			logger.warn("No auth token in cookies");
		}
		return res.status(401).json({
			success: false,
			message: "Unauthorized: No token provided",
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: string;
			email: string;
		};
		req.user = decoded;
		next();
	} catch (err) {
		logger.error("Token verification failed:", err);
		res.clearCookie("authToken");
		return res.status(401).json({
			success: false,
			message: "Unauthorized: Invalid token",
		});
	}
};
