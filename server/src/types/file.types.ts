import mongoose from "mongoose";
import { ConstitutionOption } from "../enums/constitutionOptions.enum";

export interface FileUploadResponse {
	success: boolean;
	message: string;
	files?: {
		intendedCompanyName?: string;
		alternativeCompanyName1?: string;
		alternativeCompanyName2?: string;
		companyActivities?: string;
		intendedRegisteredAddress?: string;
		financialYearEnd?: string;
		constitution?: string;
	};
	error?: string;
}

export interface CompanyDetailsInput {
	userId: mongoose.Types.ObjectId;
	intendedCompanyName?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
	alternativeCompanyName1?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
	alternativeCompanyName2?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
	companyActivities: {
		description: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
	intendedRegisteredAddress: {
		address: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
	financialYearEnd: {
		date: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
	constitution: {
		option: ConstitutionOption;
		description: string;
		fileId: mongoose.Types.ObjectId;
		text?: string;
	};
}
