import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

export const signup = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const user = new User({ email, password });
		await user.save();
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error registering user", error });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
		}

		const user = await User.findOne({ email: email.toString() });
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const token = jwt.sign(
			{ userId: user._id, email: user.email },
			JWT_SECRET,
			{ expiresIn: "24h" }
		);

		// Set HTTP-only cookie
		res.cookie("authToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		});

		res.json({
			success: true,
			user: {
				userId: user._id,
				email: user.email,
			},
		});
	} catch (error) {
		logger.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Error logging in",
		});
	}
};

export const logout = (req: Request, res: Response) => {
	res.clearCookie("authToken");
	res.json({ success: true, message: "Logged out successfully" });
};
