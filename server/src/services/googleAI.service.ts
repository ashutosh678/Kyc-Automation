// server/src/services/googleGemini.service.ts
import { GoogleGenAI } from "@google/genai"; // Ensure you have the correct package installed
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY; // Ensure you have your API key in the environment variables

export class GoogleGeminiService {
	private ai: GoogleGenAI;

	constructor() {
		this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
	}

	public async summarizeText(text: string, prompt: string): Promise<string> {
		if (!GEMINI_API_KEY) {
			throw new AppError("Gemini API key is missing", 500);
		}

		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.0-flash",
				contents: prompt,
			});

			// Assuming the response returns a JSON object with a 'summary' field
			if (!response.text) {
				throw new AppError("No summary returned from Gemini API", 404);
			}

			logger.info("------------", JSON.parse(response.text));

			return response.text; // Return the summary text
		} catch (error) {
			throw new AppError("Error summarizing text with Google Gemini", 500);
		}
	}
}
