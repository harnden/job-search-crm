import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { createCompany, deleteCompany, getCompany, listCompanies, updateCompany } from "../controllers/companies.js";

export const companiesRouter = Router();
companiesRouter.get("/", asyncHandler(listCompanies));
companiesRouter.get("/:id", asyncHandler(getCompany));
companiesRouter.post("/", asyncHandler(createCompany));
companiesRouter.put("/:id", asyncHandler(updateCompany));
companiesRouter.delete("/:id", asyncHandler(deleteCompany));
