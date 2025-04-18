import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "./cookieAuth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

export interface AuthenticatedRequest extends Request {
	user?: any;
}

export const authenticateJWT = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies.authToken;

	if (!token) {
		logger.warn("No auth token in cookies");
		return res.status(401).json({ message: "Unauthorized: No token provided" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: string;
			email: string;
		};
		req.user = decoded;
		next();
	} catch (err) {
		logger.error(`Token verification failed: ${err.message}`);
		res.clearCookie("authToken");
		return res.status(403).json({ message: "Forbidden: Invalid token" });
	}
};
