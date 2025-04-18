import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
	createCompanyDetails as createCompanyDetailsService,
	getCompanyDetails as getCompanyDetailsService,
	updateCompanyDetails as updateCompanyDetailsService,
} from "../services/companyDetails.service";
import { decodeToken } from "../utils/jwt";
import CompanyDetails from "../models/companyDetails.model";

export const createCompanyDetails = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	logger.info("Received request to create company details");
	try {
		if (!req.user?.userId) {
			throw new Error("User not authenticated");
		}

		// Check if company details already exist for this user
		const existingDetails = await CompanyDetails.findOne({
			userId: req.user.userId,
		});

		if (existingDetails) {
			// If details exist, update them
			req.params.id = existingDetails._id!.toString(); // Set the id for update
			const updatedDetails = await updateCompanyDetailsService(req);
			return res.status(200).json({
				success: true,
				message: "Company details updated successfully",
				data: updatedDetails,
			});
		}

		// If no existing details, create new
		const companyDetails = await createCompanyDetailsService(req);
		return res.status(201).json({
			success: true,
			message: "Company details created successfully",
			data: companyDetails,
		});
	} catch (error: unknown) {
		logger.error("Error creating company details", { error });
		if (error instanceof Error) {
			return next(new Error(error.message));
		} else {
			return next(new Error("An unknown error occurred"));
		}
	}
};

export const getCompanyDetails = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?.userId;

		if (!userId) {
			logger.warn("User not authenticated");
			res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
			return;
		}

		logger.info("Fetching company details for user", { userId });

		const companyDetails = await getCompanyDetailsService(userId);

		if (!companyDetails) {
			logger.info("No company details found", { userId });
			res.status(404).json({
				success: false,
				message: "No company details found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: companyDetails,
		});
	} catch (error) {
		logger.error("Error fetching company details", {
			error: error instanceof Error ? error.message : error,
		});

		// Pass a more descriptive error to the next middleware
		next(
			new Error(
				error instanceof Error ? error.message : "An unknown error occurred"
			)
		);
	}
};

export const updateCompanyDetails = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	logger.info("Received request to update company details", {
		id: req.params.id,
	});

	try {
		const companyDetails = await updateCompanyDetailsService(req);

		res.status(200).json({
			success: true,
			message: "Company details updated successfully",
			data: companyDetails,
		});
	} catch (error: unknown) {
		logger.error("Error updating company details", { error });
		if (error instanceof Error) {
			next(new Error(error.message));
		} else {
			next(new Error("An unknown error occurred"));
		}
	}
};
