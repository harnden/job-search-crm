"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActivities = listActivities;
exports.createActivity = createActivity;
const prisma_js_1 = require("../lib/prisma.js");
const schemas_js_1 = require("../validation/schemas.js");
async function listActivities(request, response) {
    const activities = await prisma_js_1.prisma.activity.findMany({
        where: {
            applicationId: typeof request.query.applicationId === "string" ? request.query.applicationId : undefined,
            contactId: typeof request.query.contactId === "string" ? request.query.contactId : undefined
        },
        include: { application: true, contact: true },
        orderBy: { timestamp: "desc" }
    });
    response.json(activities);
}
async function createActivity(request, response) {
    const data = schemas_js_1.activityCreateSchema.parse(request.body);
    const activity = await prisma_js_1.prisma.activity.create({ data });
    response.status(201).json(activity);
}
