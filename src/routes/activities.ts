import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { createActivity, listActivities } from "../controllers/activities.js";

export const activitiesRouter = Router();
activitiesRouter.get("/", asyncHandler(listActivities));
activitiesRouter.post("/", asyncHandler(createActivity));
