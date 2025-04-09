import { IConfig } from "../interfaces/config.interface";
import * as path from "path";

const config: IConfig = {
	port: parseInt(process.env.PORT || "4000", 10),
	uploadDir: path.join(__dirname, "../../uploads"),
	maxFileSize: 10 * 1024 * 1024, // 10MB
	allowedFileTypes: [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
	corsOptions: {
		origin: process.env.CORS_ORIGIN || "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	},
};

export default config;
