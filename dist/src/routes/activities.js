"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activitiesRouter = void 0;
const express_1 = require("express");
const async_handler_js_1 = require("../lib/async-handler.js");
const activities_js_1 = require("../controllers/activities.js");
exports.activitiesRouter = (0, express_1.Router)();
exports.activitiesRouter.get("/", (0, async_handler_js_1.asyncHandler)(activities_js_1.listActivities));
exports.activitiesRouter.post("/", (0, async_handler_js_1.asyncHandler)(activities_js_1.createActivity));
