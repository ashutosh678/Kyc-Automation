import { Router } from "express";
import {
	createCompanyDetails,
	getCompanyDetails,
	updateCompanyDetails,
} from "../controllers/companyDetails.controller";

const router = Router();

router.post("/", createCompanyDetails);
router.get("/:id", getCompanyDetails);
router.put("/:id", updateCompanyDetails);

export default router;
