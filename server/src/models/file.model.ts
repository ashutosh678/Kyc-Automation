import mongoose, { Document, Schema } from "mongoose";

export interface IFile extends Document {
	fileName: string;
	fileUrl: string;
	fileType: string;
	uploadDate: Date;
}

const FileSchema: Schema = new Schema({
	fileName: {
		type: String,
		required: true,
	},
	fileUrl: {
		type: String,
		required: true,
	},
	fileType: {
		type: String,
		required: true,
	},
	uploadDate: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model<IFile>("File", FileSchema);
