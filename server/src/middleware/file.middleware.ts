import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { CloudinaryService } from "../services/cloudinary.service";
import { FileType } from "../enums/fileTypes.enum";
import { IncomingForm, Files } from "formidable";
import File from "../models/file.model";

const cloudinaryService = new CloudinaryService();

export const createFileDocument = async (
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

	if (!files) {
		throw new Error("No files uploaded");
	}

	const extractedTexts = await extractTextFromFiles(files);
	for (const [key, file] of Object.entries(files)) {
		const fileObj = Array.isArray(file) ? file[0] : file;
		if (!fileObj || !fileObj.filepath) {
			console.warn(`Skipping invalid file for ${key}`);
			continue;
		}

		const cloudinaryUrl = await cloudinaryService.uploadFile(fileObj);
		uploadedFiles[key] = cloudinaryUrl;

		const fileId = await createFileDocument(
			cloudinaryUrl,
			fileObj.originalFilename || "unknown",
			key as FileType
		);
		fileIds[key] = fileId;

		fileTexts[key] = extractedTexts[key] || "";
	}

	return { uploadedFiles, fileIds, fileTexts };
};

// Function to extract text from uploaded files
export const extractTextFromFiles = async (
	files: Files
): Promise<{ [key: string]: string }> => {
	const fileTexts: { [key: string]: string } = {};

	for (const [key, file] of Object.entries(files)) {
		const fileObj = Array.isArray(file) ? file[0] : file;
		if (!fileObj || !fileObj.filepath) {
			console.warn(`Skipping invalid file for ${key}`);
			continue;
		}

		const filePath = path.resolve(fileObj.filepath);
		const fileExtension = path.extname(fileObj.originalFilename!).toLowerCase();

		let fileContent = "";

		if (fileExtension === ".pdf") {
			// Use pdf-parse for PDF files
			const dataBuffer = fs.readFileSync(filePath);
			fileContent = await pdf(dataBuffer).then((data) => data.text);
		} else if (fileExtension === ".docx") {
			// Use mammoth for DOCX files
			const { value } = await mammoth.extractRawText({ path: filePath });
			fileContent = value;
		} else {
			console.warn(`Unsupported file type for ${key}: ${fileExtension}`);
			continue;
		}

		fileTexts[key] = fileContent;
	}

	return fileTexts;
};
