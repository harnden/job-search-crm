"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listApplications = listApplications;
exports.getApplication = getApplication;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.updateApplicationStatus = updateApplicationStatus;
exports.deleteApplication = deleteApplication;
const prisma_js_1 = require("../lib/prisma.js");
const route_param_js_1 = require("../lib/route-param.js");
const error_handler_js_1 = require("../middleware/error-handler.js");
const schemas_js_1 = require("../validation/schemas.js");
async function listApplications(_request, response) {
    const applications = await prisma_js_1.prisma.application.findMany({
        include: { company: true },
        orderBy: { updatedAt: "desc" }
    });
    response.json(applications);
}
async function getApplication(request, response) {
    const application = await prisma_js_1.prisma.application.findUnique({
        where: { id: (0, route_param_js_1.routeParam)(request, "id") },
        include: { company: true, activities: { orderBy: { timestamp: "desc" } } }
    });
    if (!application)
        throw new error_handler_js_1.ApiError(404, "Application not found");
    response.json(application);
}
async function createApplication(request, response) {
    const data = schemas_js_1.applicationCreateSchema.parse(request.body);
    const { companyName: _companyName, location: _location, title: _title, ...parsed } = data;
    const jobTitle = parsed.jobTitle || request.body.title;
    const companyId = parsed.companyId || request.body.companyId;
    if (!companyId)
        throw new error_handler_js_1.ApiError(400, "companyId is required");
    if (!jobTitle)
        throw new error_handler_js_1.ApiError(400, "jobTitle or title is required");
    const application = await prisma_js_1.prisma.application.create({
        data: {
            companyId,
            jobTitle,
            status: parsed.status,
            jobUrl: parsed.jobUrl,
            description: parsed.description,
            salaryTarget: parsed.salaryTarget,
            appliedDate: parsed.appliedDate,
            discoveredDate: parsed.discoveredDate
        }
    });
    response.status(201).json(application);
}
async function updateApplication(request, response) {
    const data = schemas_js_1.applicationUpdateSchema.parse(request.body);
    const application = await prisma_js_1.prisma.application.update({ where: { id: (0, route_param_js_1.routeParam)(request, "id") }, data });
    response.json(application);
}
async function updateApplicationStatus(request, response) {
    const { status, appliedDate } = schemas_js_1.applicationStatusSchema.parse(request.body);
    const application = await prisma_js_1.prisma.application.update({
        where: { id: (0, route_param_js_1.routeParam)(request, "id") },
        data: { status: status, ...(appliedDate !== undefined ? { appliedDate } : {}) }
    });
    response.json(application);
}
async function deleteApplication(request, response) {
    await prisma_js_1.prisma.application.delete({ where: { id: (0, route_param_js_1.routeParam)(request, "id") } });
    response.status(204).send();
}
