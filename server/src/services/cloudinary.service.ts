import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../utils/AppError";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
	public async uploadFile(
		file: any,
		folder: string = "kyc_documents"
	): Promise<string> {
		try {
			const result = await cloudinary.uploader.upload(file.filepath, {
				folder,
				resource_type: "auto",
			});
			return result.secure_url;
		} catch (error) {
			throw new AppError("Error uploading file to Cloudinary", 500);
		}
	}

	public async uploadMultipleFiles(files: {
		[key: string]: any;
	}): Promise<{ [key: string]: string }> {
		const uploadPromises = Object.entries(files).map(async ([key, file]) => {
			const fileObj = Array.isArray(file) ? file[0] : file;
			if (!fileObj || !("filepath" in fileObj)) {
				throw new AppError(`Invalid file: ${key}`, 400);
			}
			const url = await this.uploadFile(fileObj);
			return [key, url];
		});

		try {
			const results = await Promise.all(uploadPromises);
			return Object.fromEntries(results);
		} catch (error) {
			throw new AppError("Error uploading files to Cloudinary", 500);
		}
	}
}
