import { Files } from "formidable";
import fs from "fs";
import path from "path";
import pdf from "pdf-parse"; // Import pdf-parse
import mammoth from "mammoth"; // Import mammoth for DOCX

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
