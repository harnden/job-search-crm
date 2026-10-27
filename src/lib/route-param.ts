import type { Request } from "express";
import { ApiError } from "../middleware/error-handler.js";

export function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, `Invalid route parameter: ${name}`);
  }
  return value;
}
