import { Request, Response, NextFunction } from "express";
import { IncomingForm, File as FormidableFile, Files } from "formidable";
import { ApiError, NotFound, InternalServerError } from "../utils/apiError";
import CompanyDetails from "../models/companyDetails.model";
import File from "../models/file.model";
import { CompanyDetailsInput } from "../types/file.types";
import { CloudinaryService } from "../services/cloudinary.service";
import mongoose from "mongoose";
import {
	parseForm,
	uploadFilesAndCreateDocuments,
	createCompanyDetails as createCompanyDetailsService,
} from "../services/companyDetails.service";

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
		throw new InternalServerError("Failed to create file document");
	}
};

export const createCompanyDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { fields, files } = await parseForm(req);
		const { fileIds } = await uploadFilesAndCreateDocuments(files);
		const companyDetails = await createCompanyDetailsService(fields, fileIds);

		res.status(201).json({
			success: true,
			message: "Company details created successfully",
			data: companyDetails,
		});
	} catch (error: unknown) {
		if (error instanceof ApiError) {
			ApiError.handle(error, res);
		} else if (error instanceof Error) {
			next(new InternalServerError(error.message));
		} else {
			next(new InternalServerError("An unknown error occurred"));
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
			return next(new NotFound("Company details not found"));
		}

		res.status(200).json({
			success: true,
			data: companyDetails,
		});
	} catch (error: unknown) {
		if (error instanceof ApiError) {
			ApiError.handle(error, res);
		} else if (error instanceof Error) {
			next(new InternalServerError(error.message));
		} else {
			next(new InternalServerError("An unknown error occurred"));
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
			return next(new NotFound("Company details not found"));
		}

		res.status(200).json({
			success: true,
			message: "Company details updated successfully",
			data: companyDetails,
		});
	} catch (error: unknown) {
		if (error instanceof ApiError) {
			ApiError.handle(error, res);
		} else if (error instanceof Error) {
			next(new InternalServerError(error.message));
		} else {
			next(new InternalServerError("An unknown error occurred"));
		}
	}
};
