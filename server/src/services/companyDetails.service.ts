import { IncomingForm, Files } from "formidable";
import { AppError } from "../utils/AppError";
import File from "../models/file.model";
import CompanyDetails from "../models/companyDetails.model";
import { CompanyDetailsInput } from "../types/file.types";
import { CloudinaryService } from "./cloudinary.service";

const cloudinaryService = new CloudinaryService();

const getOptionalFieldValue = (
	fields: any,
	fieldName: string
): string | undefined => {
	const value = fields[fieldName];
	if (!value) return undefined;
	return Array.isArray(value) ? value[0] : value;
};

const createFileDocument = async (
	fileUrl: string,
	originalFilename: string,
	fileType: string
): Promise<string> => {
	try {
		const file = await File.create({
			fileName: originalFilename,
			fileUrl: fileUrl,
			fileType: fileType,
		});
		return file._id as string;
	} catch (error) {
		console.error("Error creating file document:", error);
		throw new AppError("Failed to create file document", 500);
	}
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
				console.error("Form parsing error:", err);
				reject(new AppError(`Error parsing form data: ${err.message}`, 400));
			} else {
				resolve({ fields, files });
			}
		});
	});
};

export const uploadFilesAndCreateDocuments = async (files: Files) => {
	const uploadedFiles: { [key: string]: string } = {};
	const fileIds: { [key: string]: string } = {};

	for (const [key, file] of Object.entries(files)) {
		try {
			const fileObj = Array.isArray(file) ? file[0] : file;
			if (!fileObj || !fileObj.filepath) {
				console.warn(`Skipping invalid file for ${key}`);
				continue;
			}

			// Upload to Cloudinary
			console.log(`Uploading file for ${key}...`);
			const cloudinaryUrl = await cloudinaryService.uploadFile(fileObj);
			console.log(`Cloudinary URL for ${key}:`, cloudinaryUrl);
			uploadedFiles[key] = cloudinaryUrl;

			// Create File document
			console.log(`Creating file document for ${key}...`);
			const fileId = await createFileDocument(
				cloudinaryUrl,
				fileObj.originalFilename || "unknown",
				fileObj.mimetype || "application/octet-stream"
			);
			console.log(`Created file document with ID ${fileId} for ${key}`);
			fileIds[key] = fileId;
		} catch (error) {
			console.error(`Error processing file ${key}:`, error);
		}
	}

	return { uploadedFiles, fileIds };
};

export const createCompanyDetails = async (
	fields: any,
	fileIds: { [key: string]: string }
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
			fileId: fileIds["intendedCompanyName"],
		};
	}

	if (fileIds["companyActivities"]) {
		companyDetailsData.companyActivities = {
			description: companyActivities || "No description",
			fileId: fileIds["companyActivities"],
		};
	}

	if (fileIds["intendedRegisteredAddress"]) {
		companyDetailsData.intendedRegisteredAddress = {
			address: intendedRegisteredAddress || "No address",
			fileId: fileIds["intendedRegisteredAddress"],
		};
	}

	if (fileIds["financialYearEnd"]) {
		companyDetailsData.financialYearEnd = {
			date: financialYearEnd || new Date().toISOString(),
			fileId: fileIds["financialYearEnd"],
		};
	}

	if (fileIds["constitution"]) {
		companyDetailsData.constitution = {
			option: constitution || "i",
			fileId: fileIds["constitution"],
		};
	}

	if (fileIds["alternativeCompanyName1"]) {
		companyDetailsData.alternativeCompanyName1 = {
			name: alternativeCompanyName1 || "Alternative 1",
			fileId: fileIds["alternativeCompanyName1"],
		};
	}

	if (fileIds["alternativeCompanyName2"]) {
		companyDetailsData.alternativeCompanyName2 = {
			name: alternativeCompanyName2 || "Alternative 2",
			fileId: fileIds["alternativeCompanyName2"],
		};
	}

	console.log("Company details data to save:", companyDetailsData);

	const companyDetails = new CompanyDetails(companyDetailsData);
	await companyDetails.save();

	return companyDetails;
};
