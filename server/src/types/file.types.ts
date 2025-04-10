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
	};
	alternativeCompanyName1?: {
		name: string;
		fileId: string;
	};
	alternativeCompanyName2?: {
		name: string;
		fileId: string;
	};
	companyActivities: {
		description: string;
		fileId: string;
	};
	intendedRegisteredAddress: {
		address: string;
		fileId: string;
	};
	financialYearEnd: {
		date: string;
		fileId: string;
	};
	constitution: {
		option: "i" | "ii" | "iii";
		fileId: string;
	};
}
