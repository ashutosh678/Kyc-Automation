import mongoose, { Document, Schema } from "mongoose";
import { FileType } from "../enums/fileTypes.enum";

export interface IFile extends Document {
	fileName: string;
	fileUrl: string;
	fileType: FileType;
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
		enum: Object.values(FileType),
		required: true,
	},
	uploadDate: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model<IFile>("File", FileSchema);
