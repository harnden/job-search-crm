import { Router } from "express";
import { parseJobSpecController } from "../controllers/parser.js";
import { asyncHandler } from "../lib/async-handler.js";

export const parserRouter = Router();
parserRouter.post("/job-spec", asyncHandler(parseJobSpecController));
