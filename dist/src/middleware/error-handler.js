"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    }
}
exports.ApiError = ApiError;
const errorHandler = (error, _request, response, _next) => {
    if (error instanceof zod_1.ZodError) {
        response.status(400).json({
            error: "Validation failed",
            details: error.issues.map((issue) => ({ path: issue.path, message: issue.message }))
        });
        return;
    }
    if (error instanceof ApiError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
    }
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
            response.status(404).json({ error: "Resource not found" });
            return;
        }
        if (error.code === "P2003") {
            response.status(400).json({ error: "Related resource not found" });
            return;
        }
    }
    if (error instanceof SyntaxError && "body" in error) {
        response.status(400).json({ error: "Request body must be valid JSON" });
        return;
    }
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
};
exports.errorHandler = errorHandler;
