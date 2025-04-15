import { IncomingForm, Files } from "formidable";
import File from "../models/file.model";
import CompanyDetails from "../models/companyDetails.model";
import { CompanyDetailsInput } from "../types/file.types";
import { CloudinaryService } from "./cloudinary.service";
import { FileType } from "../enums/fileTypes.enum";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import {
	extractTextFromFiles,
	parseForm,
	uploadFilesAndCreateDocuments,
} from "../middleware/file.middleware";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const cloudinaryService = new CloudinaryService();

export const createCompanyDetails = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	logger.info("Received request to create company details");
	try {
		const { fields, files } = await parseForm(req);
		logger.info("Parsed form data", { fields, files });

		const { fileIds, fileTexts } = await uploadFilesAndCreateDocuments(files);
		logger.info("Uploaded files and created documents", { fileIds });

		const userId = req.user?.userId;
		if (!userId) {
			logger.error("User ID not found in request context");
			return res.status(400).json({ message: "User ID is required" });
		}

		const companyDetailsData: Partial<CompanyDetailsInput> = {
			userId,
		};

		const addField = (
			fieldKey: FileType,
			fieldName: string,
			defaultValue: string,
			extraField?: string
		) => {
			if (fileIds[fieldKey]) {
				companyDetailsData[fieldKey] = {
					fileId: new mongoose.Types.ObjectId(fileIds[fieldKey]),
					text: fileTexts[fieldKey] || "",
					[fieldName]: fields[extraField || fieldName] || defaultValue,
				} as any;
			}
		};

		addField(FileType.INTENDED_COMPANY_NAME, "name", "Untitled");
		addField(FileType.COMPANY_ACTIVITIES, "description", "No description");
		addField(FileType.INTENDED_REGISTERED_ADDRESS, "address", "No address");
		addField(FileType.FINANCIAL_YEAR_END, "date", new Date().toISOString());
		addField(FileType.CONSTITUTION, "option", "i");
		addField(
			FileType.ALTERNATIVE_COMPANY_NAME_1,
			"name",
			"Alternative 1",
			"alternativeCompanyName1"
		);
		addField(
			FileType.ALTERNATIVE_COMPANY_NAME_2,
			"name",
			"Alternative 2",
			"alternativeCompanyName_2"
		);

		const companyDetails = new CompanyDetails(companyDetailsData);
		await companyDetails.save();

		return res.status(201).json({
			success: true,
			message: "Company details created successfully",
			data: companyDetails,
		});
	} catch (error: unknown) {
		logger.error("Error creating company details", { error });
		if (error instanceof Error) {
			return next(new Error(error.message));
		} else {
			return next(new Error("An unknown error occurred"));
		}
	}
};
