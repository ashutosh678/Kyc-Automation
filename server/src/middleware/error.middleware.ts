import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		// Log unexpected errors
		console.error("UNEXPECTED ERROR:", err);

		res.status(500).json({
			status: "error",
			message: "Something went wrong",
		});
	}
};
