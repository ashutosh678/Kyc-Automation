import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error("Error: ", err);

	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	res.status(statusCode).json({
		success: false,
		message,
	});
};
