"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeParam = routeParam;
const error_handler_js_1 = require("../middleware/error-handler.js");
function routeParam(request, name) {
    const value = request.params[name];
    if (typeof value !== "string" || value.length === 0) {
        throw new error_handler_js_1.ApiError(400, `Invalid route parameter: ${name}`);
    }
    return value;
}
