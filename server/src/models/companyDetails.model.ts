import mongoose, { Document, Schema } from "mongoose";

export interface ICompanyDetails extends Document {
	intendedCompanyName?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
	};
	alternativeCompanyName1?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
	};
	alternativeCompanyName2?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
	};
	companyActivities?: {
		description: string;
		fileId: mongoose.Types.ObjectId;
	};
	intendedRegisteredAddress?: {
		address: string;
		fileId: mongoose.Types.ObjectId;
	};
	financialYearEnd?: {
		date: string;
		fileId: mongoose.Types.ObjectId;
	};
	constitution?: {
		option: "i" | "ii" | "iii";
		fileId: mongoose.Types.ObjectId;
	};
	createdAt: Date;
	updatedAt: Date;
}

const CompanyDetailsSchema: Schema = new Schema(
	{
		intendedCompanyName: {
			name: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
		alternativeCompanyName1: {
			name: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
		alternativeCompanyName2: {
			name: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
		companyActivities: {
			description: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
		intendedRegisteredAddress: {
			address: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
		financialYearEnd: {
			date: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
		constitution: {
			option: {
				type: String,
				enum: ["i", "ii", "iii"],
			},
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<ICompanyDetails>(
	"CompanyDetails",
	CompanyDetailsSchema
);
