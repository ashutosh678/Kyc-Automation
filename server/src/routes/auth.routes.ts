import express from "express";
import { signup, login, logout } from "../controllers/auth.controller";
import { cookieAuthMiddleware } from "../middleware/cookieAuth.middleware";
import { AuthenticatedRequest } from "../middleware/cookieAuth.middleware";
import { Response } from "express";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get(
	"/check",
	cookieAuthMiddleware,
	(req: AuthenticatedRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
		}

		res.json({
			success: true,
			user: {
				userId: req.user.userId,
				email: req.user.email,
			},
		});
	}
);

export default router;
