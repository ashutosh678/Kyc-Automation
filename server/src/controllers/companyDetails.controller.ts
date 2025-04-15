import { Request, Response, NextFunction, text } from "express";
import { createCompanyDetails as createCompanyDetailsService } from "../services/companyDetails.service";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import CompanyDetails from "../models/companyDetails.model";
import { CompanyDetailsInput } from "../types/file.types";
import { FileType } from "../enums/fileTypes.enum";
import mongoose from "mongoose";
import {
	parseForm,
	uploadFilesAndCreateDocuments,
} from "../middleware/file.middleware";

export const createCompanyDetails = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	logger.info("Received request to create company details");
	try {
		const { fields, files } = await parseForm(req);
		logger.info("Parsed form data", { fields, files });

		// Upload files and create documents
		const { fileIds, fileTexts } = await uploadFilesAndCreateDocuments(files);
		logger.info("Uploaded files and created documents", { fileIds });

		// Extract userId from the authenticated user context
		const userId = req.user?.userId;
		if (!userId) {
			logger.error("User ID not found in request context");
			return res.status(400).json({ message: "User ID is required" });
		}

		// Create company details with file URLs and text content
		const companyDetailsData: Partial<CompanyDetailsInput> = {
			userId,
		};

		// Helper function to add fields to companyDetailsData
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
				} as any; // Use 'as any' to bypass TypeScript error temporarily
			} else {
				logger.warn(`Field ${fieldKey} not found in uploaded files`);
			}
		};

		// Add fields using the helper function
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
			"alternativeCompanyName2"
		);

		// Create and save the company details
		const companyDetails = new CompanyDetails(companyDetailsData);
		await companyDetails.save();

		logger.info("Company details created successfully", { companyDetails });
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

export const getCompanyDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	logger.info("Received request to get company details", { id: req.params.id });
	try {
		const companyDetails = await CompanyDetails.findById(req.params.id)
			.populate("intendedCompanyName.fileId")
			.populate("alternativeCompanyName1.fileId")
			.populate("alternativeCompanyName2.fileId")
			.populate("companyActivities.fileId")
			.populate("intendedRegisteredAddress.fileId")
			.populate("financialYearEnd.fileId")
			.populate("constitution.fileId");

		if (!companyDetails) {
			logger.warn("Company details not found", { id: req.params.id });
			return next(new Error("Company details not found"));
		}

		res.status(200).json({
			success: true,
			data: companyDetails,
		});
	} catch (error: unknown) {
		logger.error("Error fetching company details", { error });
		if (error instanceof Error) {
			next(new Error(error.message));
		} else {
			next(new Error("An unknown error occurred"));
		}
	}
};

export const updateCompanyDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	logger.info("Received request to update company details", {
		id: req.params.id,
	});
	try {
		const companyDetailsData: Partial<CompanyDetailsInput> = req.body;

		const companyDetails = await CompanyDetails.findByIdAndUpdate(
			req.params.id,
			companyDetailsData,
			{ new: true, runValidators: true }
		);

		if (!companyDetails) {
			logger.warn("Company details not found for update", {
				id: req.params.id,
			});
			return next(new Error("Company details not found"));
		}

		res.status(200).json({
			success: true,
			message: "Company details updated successfully",
			data: companyDetails,
		});
	} catch (error: unknown) {
		logger.error("Error updating company details", { error });
		if (error instanceof Error) {
			next(new Error(error.message));
		} else {
			next(new Error("An unknown error occurred"));
		}
	}
};
