import type { Request, Response } from "express";
import { parseJobSpec } from "../services/job-spec-parser.js";
import { jobSpecSchema } from "../validation/schemas.js";

export async function parseJobSpecController(request: Request, response: Response) {
  const { rawText } = jobSpecSchema.parse(request.body);
  const parsed = await parseJobSpec(rawText);
  response.json(parsed);
}
