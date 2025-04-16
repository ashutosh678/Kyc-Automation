// server/src/services/googleGemini.service.ts
import { GoogleGenAI } from "@google/genai";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

export class GoogleGeminiService {
	private ai: GoogleGenAI;

	constructor() {
		if (!GEMINI_API_KEY) {
			throw new AppError("Gemini API key is missing", 500);
		}
		this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
	}

	public async summarizeText(text: string, prompt: string): Promise<string> {
		try {
			logger.info("Sending request to Google Gemini API...");

			const response = await this.ai.models.generateContent({
				model: "gemini-2.0-flash",
				contents: `${prompt} \n\n\n ${text}`,
				config: {
					responseMimeType: "application/json",
				},
			});

			logger.info("Received response from Google Gemini API", response);

			// Check if the response contains candidates
			if (
				!response ||
				!response.candidates ||
				response.candidates.length === 0
			) {
				throw new AppError("No summary returned from Gemini API", 404);
			}

			// Extract the summary from the first candidate
			const summary = response.candidates[0].content!.parts![0].text!;
			logger.info("Summary generated:", summary);

			return summary; // Return the summary text
		} catch (error) {
			logger.error("Error summarizing text with Google Gemini", error);
			throw new AppError("Error summarizing text with Google Gemini", 500);
		}
	}
}
