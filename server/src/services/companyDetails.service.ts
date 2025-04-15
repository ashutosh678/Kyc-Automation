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

	const companyDetails = new CompanyDetails(companyDetailsData);
	await companyDetails.save();

	logger.info("Company details created successfully", { companyDetails });
	return companyDetails;
};
