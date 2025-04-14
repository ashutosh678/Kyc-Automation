import { Request, Response, NextFunction, text } from "express";
import {
	parseForm,
	uploadFilesAndCreateDocuments,
	createCompanyDetails as createCompanyDetailsService,
} from "../services/companyDetails.service";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import CompanyDetails from "../models/companyDetails.model";
import { CompanyDetailsInput } from "../types/file.types";
import { FileType } from "../enums/fileTypes.enum";
import mongoose from "mongoose";

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
			intendedCompanyName: {
				name: fields.intendedCompanyName || "Untitled",
				fileId: new mongoose.Types.ObjectId(
					fileIds[FileType.INTENDED_COMPANY_NAME]
				),
				text: fileTexts[FileType.INTENDED_COMPANY_NAME] || "", // Ensure text is included
			},
			companyActivities: {
				description: fields.companyActivities || "No description",
				fileId: new mongoose.Types.ObjectId(
					fileIds[FileType.COMPANY_ACTIVITIES]
				),
				text: fileTexts[FileType.COMPANY_ACTIVITIES] || "", // Ensure text is included
			},
			intendedRegisteredAddress: {
				address: fields.intendedRegisteredAddress || "No address",
				fileId: new mongoose.Types.ObjectId(
					fileIds[FileType.INTENDED_REGISTERED_ADDRESS]
				),
				text: fileTexts[FileType.INTENDED_REGISTERED_ADDRESS] || "", // Ensure text is included
			},
			// Add similar entries for other fields...
		};

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
