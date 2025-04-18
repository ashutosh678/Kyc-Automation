// server/src/helper/companyDetails.helper.ts
import mongoose from "mongoose";
import { FileType } from "../enums/fileTypes.enum";
import { GoogleGeminiService } from "../services/googleAI.service";
import { prompts } from "../types/prompts";
import { logger } from "../utils/logger";

const googleGeminiService = new GoogleGeminiService();

export const addField = async (
	companyDetailsData: any,
	fieldKey: FileType,
	fieldName: string,
	fileIds: any,
	fileTexts: any,
	existingDetails?: any
) => {
	if (fileIds[fieldKey]) {
		// Check if we should preserve existing file
		if (
			existingDetails?.[fieldKey]?.fileId &&
			isFileSame(
				existingDetails[fieldKey].fileId,
				new mongoose.Types.ObjectId(fileIds[fieldKey])
			)
		) {
			// Preserve existing data
			companyDetailsData[fieldKey] = {
				...existingDetails[fieldKey],
			};
			return;
		}

		const prompt = `${prompts[fieldKey]}\n\nPlease return only the value for "${fieldName}" without any additional formatting.`;
		const textToSummarize = fileTexts[fieldKey] || "";

		// Call the summarization service with the prompt and text
		const fieldValue = await googleGeminiService.summarizeText(
			textToSummarize,
			prompt
		);

		// Parse the response to extract the value
		let parsedValue;
		try {
			const jsonResponse = JSON.parse(fieldValue);
			parsedValue = jsonResponse[fieldName];
		} catch (error) {
			logger.error("Error parsing JSON response", { fieldValue, error });
			parsedValue = fieldValue;
		}

		// Only add the field if it has a value
		if (parsedValue) {
			companyDetailsData[fieldKey] = {
				fileId: new mongoose.Types.ObjectId(fileIds[fieldKey]),
				text: fileTexts[fieldKey] || "",
				[fieldName]: parsedValue,
			};
		} else {
			logger.warn(`Field ${fieldName} is empty and will not be added.`);
		}
	} else if (existingDetails?.[fieldKey]) {
		// Preserve existing data if no new file is uploaded
		companyDetailsData[fieldKey] = {
			...existingDetails[fieldKey],
		};
	} else {
		logger.warn(`Field ${fieldKey} not found in uploaded files`);
	}
};

/**
 * Checks if the uploaded file is the same as the existing file.
 * @param existingFileId - The existing file ID.
 * @param newFileId - The new file ID.
 * @returns True if the files are the same, otherwise false.
 */
export const isFileSame = (
	existingFileId: mongoose.Types.ObjectId | undefined,
	newFileId: mongoose.Types.ObjectId | undefined
): boolean => {
	if (!existingFileId || !newFileId) {
		return false;
	}
	const isSame = existingFileId.toString() === newFileId.toString();
	if (isSame) {
		logger.info("The uploaded file is the same as the existing file.");
	}
	return isSame;
};
