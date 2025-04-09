import { Request, Response, NextFunction } from "express";
import { IncomingForm, File as FormidableFile, Files } from "formidable";
import { AppError } from "../utils/AppError";
import CompanyDetails from "../models/companyDetails.model";
import File from "../models/file.model";
import { CompanyDetailsInput } from "../types/file.types";
import { CloudinaryService } from "../services/cloudinary.service";
import mongoose from "mongoose";

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

export const createCompanyDetails = async (
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
		form.parse(req, async (err, fields, files: Files) => {
			if (err) {
				console.error("Form parsing error:", err);
				next(new AppError(`Error parsing form data: ${err.message}`, 400));
				return;
			}

			try {
				console.log("Received fields:", fields);
				console.log("Received files:", files);

				// Upload files to Cloudinary and create File documents
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

				console.log("Uploaded files:", uploadedFiles);
				console.log("File IDs:", fileIds);

				// Get all field values (all optional)
				const intendedCompanyName = getOptionalFieldValue(
					fields,
					"intendedCompanyName"
				);
				const companyActivities = getOptionalFieldValue(
					fields,
					"companyActivities"
				);
				const intendedRegisteredAddress = getOptionalFieldValue(
					fields,
					"intendedRegisteredAddress"
				);
				const financialYearEnd = getOptionalFieldValue(
					fields,
					"financialYearEnd"
				);
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

				res.status(201).json({
					success: true,
					message: "Company details created successfully",
					data: companyDetails,
				});
			} catch (error) {
				console.error("Error in company details creation:", error);
				if (error instanceof AppError) {
					next(error);
				} else if (error instanceof Error) {
					next(
						new AppError(
							`Error creating company details: ${error.message}`,
							500
						)
					);
				} else {
					next(new AppError("Error creating company details", 500));
				}
			}
		});
	} catch (error) {
		console.error("Error in form processing:", error);
		if (error instanceof Error) {
			next(new AppError(`Error processing request: ${error.message}`, 500));
		} else {
			next(new AppError("Error processing request", 500));
		}
	}
};

export const getCompanyDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
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
			next(new AppError("Company details not found", 404));
			return;
		}

		res.status(200).json({
			success: true,
			data: companyDetails,
		});
	} catch (error) {
		console.error("Error fetching company details:", error);
		if (error instanceof Error) {
			next(
				new AppError(`Error fetching company details: ${error.message}`, 500)
			);
		} else {
			next(new AppError("Error fetching company details", 500));
		}
	}
};

export const updateCompanyDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const companyDetailsData: Partial<CompanyDetailsInput> = req.body;

		const companyDetails = await CompanyDetails.findByIdAndUpdate(
			req.params.id,
			companyDetailsData,
			{ new: true, runValidators: true }
		);

		if (!companyDetails) {
			next(new AppError("Company details not found", 404));
			return;
		}

		res.status(200).json({
			success: true,
			message: "Company details updated successfully",
			data: companyDetails,
		});
	} catch (error) {
		next(new AppError("Error updating company details", 500));
	}
};
