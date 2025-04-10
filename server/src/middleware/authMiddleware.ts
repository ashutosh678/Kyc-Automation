import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

export interface AuthenticatedRequest extends Request {
	user?: any;
}

export const authenticateJWT = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(" ")[1];

		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) {
				logger.error(`Token verification failed: ${err.message}`);
				return res.status(403).json({ message: "Forbidden: Invalid token" });
			}

			logger.info("Authenticated user", { user });
			req.user = user;
			next();
		});
	} else {
		logger.warn("Authorization header missing");
		res.status(401).json({ message: "Unauthorized: No token provided" });
	}
};
