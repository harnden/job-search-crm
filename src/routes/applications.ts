import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { createApplication, createApplicationActionItem, deleteApplication, deleteApplicationActionItem, getApplication, listApplications, updateApplication, updateApplicationActionItem, updateApplicationStatus } from "../controllers/applications.js";

export const applicationsRouter = Router();
applicationsRouter.get("/", asyncHandler(listApplications));
applicationsRouter.get("/:id", asyncHandler(getApplication));
applicationsRouter.post("/", asyncHandler(createApplication));
applicationsRouter.put("/:id", asyncHandler(updateApplication));
applicationsRouter.patch("/:id/status", asyncHandler(updateApplicationStatus));
applicationsRouter.post("/:id/actions", asyncHandler(createApplicationActionItem));
applicationsRouter.patch("/:id/actions/:actionId", asyncHandler(updateApplicationActionItem));
applicationsRouter.delete("/:id/actions/:actionId", asyncHandler(deleteApplicationActionItem));
applicationsRouter.delete("/:id", asyncHandler(deleteApplication));
