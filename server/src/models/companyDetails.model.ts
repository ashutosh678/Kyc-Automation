import mongoose, { Document, Schema } from "mongoose";

export interface ICompanyDetails extends Document {
	userId: mongoose.Types.ObjectId;
	intendedCompanyName?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	alternativeCompanyName1?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	alternativeCompanyName2?: {
		name: string;
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	companyActivities?: {
		description: string;
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	intendedRegisteredAddress?: {
		address: string;
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	financialYearEnd?: {
		date: string;
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	constitution?: {
		option: "i" | "ii" | "iii";
		fileId: mongoose.Types.ObjectId;
		text: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

const CompanyDetailsSchema: Schema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		intendedCompanyName: {
			name: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
		},
		alternativeCompanyName1: {
			name: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
		},
		alternativeCompanyName2: {
			name: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
		},
		companyActivities: {
			description: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
		},
		intendedRegisteredAddress: {
			address: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
		},
		financialYearEnd: {
			date: { type: String },
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
		},
		constitution: {
			option: {
				type: String,
				enum: ["i", "ii", "iii"],
			},
			fileId: { type: Schema.Types.ObjectId, ref: "File" },
			text: { type: String },
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
