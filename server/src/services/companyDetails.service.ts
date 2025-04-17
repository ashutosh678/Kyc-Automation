import CompanyDetails, {
	ICompanyDetails,
} from "../models/companyDetails.model";
import { CompanyDetailsInput } from "../types/file.types";
import { FileType } from "../enums/fileTypes.enum";
import { ConstitutionOption } from "../enums/constitutionOptions.enum";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import {
	parseForm,
	uploadFilesAndCreateDocuments,
} from "../middleware/file.middleware";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prompts } from "../types/prompts";
import { GoogleGeminiService } from "./googleAI.service";
import { addField } from "../helper/companyDetails.helper";
import { isFileSame } from "../helper/companyDetails.helper";

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

	if (fields.option) {
		const option = fields.option[0];
		logger.info("---------------------Constitution option", { option });

		if (!option) {
			logger.error("Constitution option is required but not provided.");
			throw new Error("Constitution option is required.");
		}

		const optionValue = Array.isArray(option) ? option[0] : option;

		if (fileIds[FileType.CONSTITUTION]) {
			const descriptionPrompt = prompts.constitution;
			const descriptionText = await googleGeminiService.summarizeText(
				fileTexts[FileType.CONSTITUTION] || "",
				descriptionPrompt
			);

			companyDetailsData.constitution = {
				option: Number(optionValue) as ConstitutionOption,
				description: descriptionText,
				fileId: new mongoose.Types.ObjectId(fileIds[FileType.CONSTITUTION]),
				text: fileTexts[FileType.CONSTITUTION] || "",
			};
		} else {
			logger.warn("Constitution document is not provided.");
		}
	} else {
		logger.warn("Constitution's option field is not provided.");
	}

	await Promise.all([
		addField(
			companyDetailsData,
			FileType.INTENDED_COMPANY_NAME,
			"name",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.COMPANY_ACTIVITIES,
			"description",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.INTENDED_REGISTERED_ADDRESS,
			"address",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.FINANCIAL_YEAR_END,
			"date",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.ALTERNATIVE_COMPANY_NAME_1,
			"name",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.ALTERNATIVE_COMPANY_NAME_2,
			"name",
			fileIds,
			fileTexts
		),
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
	let companyDetails;
	companyDetails = await CompanyDetails.findById(id)
		.populate("intendedCompanyName.fileId")
		.populate("alternativeCompanyName1.fileId")
		.populate("alternativeCompanyName2.fileId")
		.populate("companyActivities.fileId")
		.populate("intendedRegisteredAddress.fileId")
		.populate("financialYearEnd.fileId")
		.populate("constitution.fileId");

	if (!companyDetails) {
		companyDetails = await CompanyDetails.findById({ userId: id })
			.populate("intendedCompanyName.fileId")
			.populate("alternativeCompanyName1.fileId")
			.populate("alternativeCompanyName2.fileId")
			.populate("companyActivities.fileId")
			.populate("intendedRegisteredAddress.fileId")
			.populate("financialYearEnd.fileId")
			.populate("constitution.fileId");

		logger.warn("Company details not found", { id });
		throw new Error("Company details not found");
	}

	return companyDetails;
};

export const updateCompanyDetails = async (
	req: AuthenticatedRequest
): Promise<ICompanyDetails> => {
	logger.info("Updating company details", { id: req.params.id });

	const userId = req.user?.userId;
	if (!userId) {
		throw new Error("User ID is required");
	}

	const { fields, files } = await parseForm(req);
	logger.info("Parsed form data for update", { fields, files });

	const { fileIds, fileTexts } = await uploadFilesAndCreateDocuments(files);

	const companyDetailsData: Partial<CompanyDetailsInput> = {
		userId,
	};

	const existingCompanyDetails = await CompanyDetails.findById(req.params.id);

	if (!existingCompanyDetails) {
		throw new Error("Company details not found");
	}

	if (fields.option) {
		const option = fields.option[0];

		if (!option) {
			logger.error("Constitution option is required but not provided.");
			throw new Error("Constitution option is required.");
		}

		const optionValue = Array.isArray(option) ? option[0] : option;

		companyDetailsData.constitution = {
			...existingCompanyDetails.constitution,
			option: Number(optionValue) as ConstitutionOption,
			description: existingCompanyDetails.constitution?.description || "",
			fileId:
				existingCompanyDetails.constitution?.fileId ||
				new mongoose.Types.ObjectId(),
		};

		const newFileId = fileIds[FileType.CONSTITUTION]
			? new mongoose.Types.ObjectId(fileIds[FileType.CONSTITUTION])
			: existingCompanyDetails.constitution?.fileId;

		if (!isFileSame(existingCompanyDetails.constitution?.fileId, newFileId)) {
			const descriptionPrompt = prompts.constitution;
			const descriptionText = await googleGeminiService.summarizeText(
				fileTexts[FileType.CONSTITUTION] || "",
				descriptionPrompt
			);

			companyDetailsData.constitution = {
				...companyDetailsData.constitution,
				description: descriptionText || "",
				fileId:
					new mongoose.Types.ObjectId(newFileId) ||
					new mongoose.Types.ObjectId(
						existingCompanyDetails.constitution?.fileId
					),
				text: fileTexts[FileType.CONSTITUTION] || "",
			};
		} else {
			logger.info("Constitution file is the same, not updating.");
		}
	} else {
		logger.warn("Constitution's option field is not provided.");
	}

	await Promise.all([
		addField(
			companyDetailsData,
			FileType.INTENDED_COMPANY_NAME,
			"name",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.COMPANY_ACTIVITIES,
			"description",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.INTENDED_REGISTERED_ADDRESS,
			"address",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.FINANCIAL_YEAR_END,
			"date",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.ALTERNATIVE_COMPANY_NAME_1,
			"name",
			fileIds,
			fileTexts
		),
		addField(
			companyDetailsData,
			FileType.ALTERNATIVE_COMPANY_NAME_2,
			"name",
			fileIds,
			fileTexts
		),
	]);

	const updatedCompanyDetails = await CompanyDetails.findByIdAndUpdate(
		req.params.id,
		companyDetailsData,
		{ new: true, runValidators: true }
	);

	if (!updatedCompanyDetails) {
		logger.warn("Company details not found for update", { id: req.params.id });
		throw new Error("Company details not found");
	}

	logger.info("Company details updated successfully", {
		updatedCompanyDetails,
	});
	return updatedCompanyDetails;
};
