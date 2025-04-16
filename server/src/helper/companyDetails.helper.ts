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
	fileTexts: any
) => {
	if (fileIds[fieldKey]) {
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
			parsedValue = jsonResponse[fieldName]; // Extract the specific field value
		} catch (error) {
			logger.error("Error parsing JSON response", { fieldValue, error });
			parsedValue = fieldValue; // Fallback to raw value if parsing fails
		}

		// Only add the field if it has a value
		if (parsedValue) {
			companyDetailsData[fieldKey] = {
				fileId: new mongoose.Types.ObjectId(fileIds[fieldKey]),
				text: fileTexts[fieldKey] || "",
				[fieldName]: parsedValue,
			} as any;
		} else {
			logger.warn(`Field ${fieldName} is empty and will not be added.`);
		}
	} else {
		logger.warn(`Field ${fieldKey} not found in uploaded files`);
	}
};
