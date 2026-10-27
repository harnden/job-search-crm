import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { createApplication, deleteApplication, getApplication, listApplications, updateApplication, updateApplicationStatus } from "../controllers/applications.js";

export const applicationsRouter = Router();
applicationsRouter.get("/", asyncHandler(listApplications));
applicationsRouter.get("/:id", asyncHandler(getApplication));
applicationsRouter.post("/", asyncHandler(createApplication));
applicationsRouter.put("/:id", asyncHandler(updateApplication));
applicationsRouter.patch("/:id/status", asyncHandler(updateApplicationStatus));
applicationsRouter.delete("/:id", asyncHandler(deleteApplication));
