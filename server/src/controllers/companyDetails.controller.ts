import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { CompanyDetailsInput } from "../types/file.types";
import {
	createCompanyDetails as createCompanyDetailsService,
	getCompanyDetails as getCompanyDetailsService,
	updateCompanyDetails as updateCompanyDetailsService,
} from "../services/companyDetails.service";

export const createCompanyDetails = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<Response | void> => {
	logger.info("Received request to create company details");
	try {
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
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	logger.info("Received request to get company details", { id: req.params.id });

	try {
		const companyDetails = await getCompanyDetailsService(req.params.id);
		res.status(200).json({
			success: true,
			data: companyDetails,
		});
	} catch (error: unknown) {
		logger.error("Error fetching company details", { error });
		if (error instanceof Error) {
			next(new Error(error.message));
		} else {
			next(new Error("An unknown error occurred"));
		}
	}
};

export const updateCompanyDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	logger.info("Received request to update company details", {
		id: req.params.id,
	});
	try {
		const companyDetailsData: Partial<CompanyDetailsInput> = req.body;
		const companyDetails = await updateCompanyDetailsService(
			req.params.id,
			companyDetailsData
		);

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
