import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

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
		const user = await User.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ message: "Invalid email or password" });
		}
		const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
			expiresIn: "24h",
		});
		res.json({ token });
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error });
	}
};

export const logout = (req: Request, res: Response) => {
	// For JWT, logout is handled client-side by deleting the token
	res.json({ message: "User logged out successfully" });
};
