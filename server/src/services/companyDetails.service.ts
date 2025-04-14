import { IncomingForm, Files } from "formidable";
import File from "../models/file.model";
import CompanyDetails from "../models/companyDetails.model";
import { CompanyDetailsInput } from "../types/file.types";
import { CloudinaryService } from "./cloudinary.service";
import { FileType } from "../enums/fileTypes.enum";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { extractTextFromFiles } from "../middleware/file.middleware";

const cloudinaryService = new CloudinaryService();

const getOptionalFieldValue = (
	fields: any,
	fieldName: string
): string | undefined => {
	const value = fields[fieldName];
	return Array.isArray(value) ? value[0] : value;
};

const createFileDocument = async (
	fileUrl: string,
	originalFilename: string,
	fileType: FileType
): Promise<string> => {
	const file = await File.create({
		fileName: originalFilename,
		fileUrl: fileUrl,
		fileType: fileType,
	});
	return file._id as string;
};

export const parseForm = (req: any): Promise<{ fields: any; files: Files }> => {
	const form = new IncomingForm({
		keepExtensions: true,
		maxFileSize: 10 * 1024 * 1024, // 10MB
		multiples: true,
	});

	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				reject(new Error(`Error parsing form data: ${err.message}`));
			} else {
				resolve({ fields, files });
			}
		});
	});
};

export const uploadFilesAndCreateDocuments = async (files: Files) => {
	const uploadedFiles: { [key: string]: string } = {};
	const fileIds: { [key: string]: string } = {};
	const fileTexts: { [key: string]: string } = {};

	// Ensure files is of type Files
	if (!files) {
		throw new Error("No files uploaded");
	}

	// Extract text from files
	const extractedTexts = await extractTextFromFiles(files);
	for (const [key, file] of Object.entries(files)) {
		const fileObj = Array.isArray(file) ? file[0] : file;
		if (!fileObj || !fileObj.filepath) {
			console.warn(`Skipping invalid file for ${key}`);
			continue;
		}

		// Upload to Cloudinary
		const cloudinaryUrl = await cloudinaryService.uploadFile(fileObj);
		uploadedFiles[key] = cloudinaryUrl;

		// Create File document
		const fileId = await createFileDocument(
			cloudinaryUrl,
			fileObj.originalFilename || "unknown",
			key as FileType
		);
		fileIds[key] = fileId;

		// Store the extracted text
		fileTexts[key] = extractedTexts[key] || ""; // Ensure text is included
	}

	return { uploadedFiles, fileIds, fileTexts }; // Return fileTexts along with fileIds
};

export const createCompanyDetails = async (
	fields: any,
	fileIds: { [key: string]: string },
	fileTexts: { [key: string]: string }
) => {
	// Get all field values (all optional)
	const intendedCompanyName = getOptionalFieldValue(
		fields,
		"intendedCompanyName"
	);
	const companyActivities = getOptionalFieldValue(fields, "companyActivities");
	const intendedRegisteredAddress = getOptionalFieldValue(
		fields,
		"intendedRegisteredAddress"
	);
	const financialYearEnd = getOptionalFieldValue(fields, "financialYearEnd");
	const constitution = getOptionalFieldValue(fields, "constitution") as
		| "i"
		| "ii"
		| "iii"
		| undefined;
	const alternativeCompanyName1 = getOptionalFieldValue(
		fields,
		"alternativeCompanyName1"
	);
	const alternativeCompanyName2 = getOptionalFieldValue(
		fields,
		"alternativeCompanyName2"
	);

	// Create company details with file URLs
	const companyDetailsData: Partial<CompanyDetailsInput> = {};

	// Add fields only if they exist
	if (fileIds["intendedCompanyName"]) {
		companyDetailsData.intendedCompanyName = {
			name: intendedCompanyName || "Untitled",
			fileId: new mongoose.Types.ObjectId(
				fileIds[FileType.INTENDED_COMPANY_NAME]
			),
			text: fileTexts[FileType.INTENDED_COMPANY_NAME] || "",
		};
		console.log(
			"-------------------------------------companyDetailsData.intendedCompanyName",
			companyDetailsData.intendedCompanyName
		);
	}

	if (fileIds["companyActivities"]) {
		companyDetailsData.companyActivities = {
			description: companyActivities || "No description",
			fileId: new mongoose.Types.ObjectId(fileIds[FileType.COMPANY_ACTIVITIES]),
			text: fileTexts[FileType.COMPANY_ACTIVITIES] || "",
		};
	}

	if (fileIds["intendedRegisteredAddress"]) {
		companyDetailsData.intendedRegisteredAddress = {
			address: intendedRegisteredAddress || "No address",
			fileId: new mongoose.Types.ObjectId(
				fileIds[FileType.INTENDED_REGISTERED_ADDRESS]
			),
			text: fileTexts[FileType.INTENDED_REGISTERED_ADDRESS] || "",
		};
	}

	if (fileIds["financialYearEnd"]) {
		companyDetailsData.financialYearEnd = {
			date: financialYearEnd || new Date().toISOString(),
			fileId: new mongoose.Types.ObjectId(fileIds[FileType.FINANCIAL_YEAR_END]),
			text: fileTexts[FileType.FINANCIAL_YEAR_END] || "",
		};
	}

	if (fileIds["constitution"]) {
		companyDetailsData.constitution = {
			option: constitution || "i",
			fileId: new mongoose.Types.ObjectId(fileIds[FileType.CONSTITUTION]),
			text: fileTexts[FileType.CONSTITUTION] || "",
		};
	}

	if (fileIds["alternativeCompanyName1"]) {
		companyDetailsData.alternativeCompanyName1 = {
			name: alternativeCompanyName1 || "Alternative 1",
			fileId: new mongoose.Types.ObjectId(
				fileIds[FileType.ALTERNATIVE_COMPANY_NAME_1]
			),
			text: fileTexts[FileType.ALTERNATIVE_COMPANY_NAME_1] || "",
		};
	}

	if (fileIds["alternativeCompanyName2"]) {
		companyDetailsData.alternativeCompanyName2 = {
			name: alternativeCompanyName2 || "Alternative 2",
			fileId: new mongoose.Types.ObjectId(
				fileIds[FileType.ALTERNATIVE_COMPANY_NAME_2]
			),
			text: fileTexts[FileType.ALTERNATIVE_COMPANY_NAME_2] || "",
		};
	}

	// Include userId in companyDetailsData
	companyDetailsData.userId = fields.userId;

	const companyDetails = new CompanyDetails(companyDetailsData);
	await companyDetails.save();

	logger.info("companyDetails", companyDetails);

	return companyDetails;
};
