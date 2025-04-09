import { Request, Response, NextFunction } from "express";
import { IncomingForm } from "formidable";
import { FileUploadResponse } from "../types/file.types";
import { AppError } from "../utils/AppError";
import { CloudinaryService } from "../services/cloudinary.service";

const cloudinaryService = new CloudinaryService();

export const uploadFiles = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const form = new IncomingForm({
		keepExtensions: true,
		maxFileSize: 10 * 1024 * 1024, // 10MB
		multiples: true,
	});

	try {
		form.parse(req, async (err, fields, files) => {
			if (err) {
				next(new AppError("Error parsing files", 500));
				return;
			}

			try {
				const uploadedFiles = await cloudinaryService.uploadMultipleFiles(
					files
				);

				const response: FileUploadResponse = {
					success: true,
					message: "Files uploaded successfully",
					files: uploadedFiles,
				};

				res.status(200).json(response);
			} catch (error) {
				next(error);
			}
		});
	} catch (error) {
		next(new AppError("Error processing files", 500));
	}
};
