"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserRouter = void 0;
const express_1 = require("express");
const parser_js_1 = require("../controllers/parser.js");
const async_handler_js_1 = require("../lib/async-handler.js");
exports.parserRouter = (0, express_1.Router)();
exports.parserRouter.post("/job-spec", (0, async_handler_js_1.asyncHandler)(parser_js_1.parseJobSpecController));
