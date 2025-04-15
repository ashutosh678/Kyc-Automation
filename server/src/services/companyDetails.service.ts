import CompanyDetails, {
	ICompanyDetails,
} from "../models/companyDetails.model"; // Import the interface
import { CompanyDetailsInput } from "../types/file.types";
import { FileType } from "../enums/fileTypes.enum";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import {
	parseForm,
	uploadFilesAndCreateDocuments,
} from "../middleware/file.middleware";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prompts } from "../types/prompts";
import { GoogleGeminiService } from "./googleAI.service";

const googleGeminiService = new GoogleGeminiService();

export const createCompanyDetails = async (
	req: AuthenticatedRequest
): Promise<ICompanyDetails> => {
	logger.info("Creating company details");
	const { fields, files } = await parseForm(req);
	logger.info("Parsed form data", { fields, files });

	// Upload files and create documents
	const { fileIds, fileTexts } = await uploadFilesAndCreateDocuments(files);
	logger.info("Uploaded files and created documents", { fileIds });

	const userId = req.user?.userId;
	if (!userId) {
		throw new Error("User ID is required");
	}

	const companyDetailsData: Partial<CompanyDetailsInput> = {
		userId,
	};

	// Helper function to add fields to companyDetailsData
	const addField = async (fieldKey: FileType, fieldName: string) => {
		if (fileIds[fieldKey]) {
			const prompt = `${prompts[fieldKey]}\n\nPlease return only the value for "${fieldName}" without any additional formatting.`;
			const textToSummarize = fileTexts[fieldKey] || "";

			// Call the summarization service with the prompt and text
			const fieldValue = await googleGeminiService.summarizeText(
				textToSummarize,
				prompt
			);

			// Parse the response to extract the value
			let parsedValue;
			try {
				const jsonResponse = JSON.parse(fieldValue);
				parsedValue = jsonResponse[fieldName]; // Extract the specific field value
			} catch (error) {
				logger.error("Error parsing JSON response", { fieldValue, error });
				parsedValue = fieldValue; // Fallback to raw value if parsing fails
			}

			// Only add the field if it has a value
			if (parsedValue) {
				companyDetailsData[fieldKey] = {
					fileId: new mongoose.Types.ObjectId(fileIds[fieldKey]),
					text: fileTexts[fieldKey] || "",
					[fieldName]: parsedValue,
				} as any;
			} else {
				logger.warn(`Field ${fieldName} is empty and will not be added.`);
			}
		} else {
			logger.warn(`Field ${fieldKey} not found in uploaded files`);
		}
	};

	// Add fields using the helper function
	await Promise.all([
		addField(FileType.INTENDED_COMPANY_NAME, "name"),
		addField(FileType.COMPANY_ACTIVITIES, "description"),
		addField(FileType.INTENDED_REGISTERED_ADDRESS, "address"),
		addField(FileType.FINANCIAL_YEAR_END, "date"),
		addField(FileType.CONSTITUTION, "option"),
		addField(FileType.ALTERNATIVE_COMPANY_NAME_1, "name"),
		addField(FileType.ALTERNATIVE_COMPANY_NAME_2, "name"),
	]);

	const companyDetails = new CompanyDetails(companyDetailsData);
	await companyDetails.save();

	logger.info("Company details created successfully", { companyDetails });
	return companyDetails;
};

export const getCompanyDetails = async (
	id: string
): Promise<ICompanyDetails | null> => {
	logger.info("Fetching company details", { id });
	const companyDetails = await CompanyDetails.findById(id)
		.populate("intendedCompanyName.fileId")
		.populate("alternativeCompanyName1.fileId")
		.populate("alternativeCompanyName2.fileId")
		.populate("companyActivities.fileId")
		.populate("intendedRegisteredAddress.fileId")
		.populate("financialYearEnd.fileId")
		.populate("constitution.fileId");

	if (!companyDetails) {
		logger.warn("Company details not found", { id });
		throw new Error("Company details not found");
	}

	return companyDetails;
};

export const updateCompanyDetails = async (
	id: string,
	companyDetailsData: Partial<CompanyDetailsInput>
): Promise<ICompanyDetails | null> => {
	logger.info("Updating company details", { id });
	const companyDetails = await CompanyDetails.findByIdAndUpdate(
		id,
		companyDetailsData,
		{ new: true, runValidators: true }
	);

	if (!companyDetails) {
		logger.warn("Company details not found for update", { id });
		throw new Error("Company details not found");
	}

	return companyDetails;
};
