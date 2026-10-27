"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCompanies = listCompanies;
exports.getCompany = getCompany;
exports.createCompany = createCompany;
exports.updateCompany = updateCompany;
exports.deleteCompany = deleteCompany;
const prisma_js_1 = require("../lib/prisma.js");
const route_param_js_1 = require("../lib/route-param.js");
const error_handler_js_1 = require("../middleware/error-handler.js");
const schemas_js_1 = require("../validation/schemas.js");
const companyInclude = { contacts: true, applications: true };
async function listCompanies(_request, response) {
    const companies = await prisma_js_1.prisma.company.findMany({
        include: { _count: { select: { contacts: true, applications: true } } },
        orderBy: { name: "asc" }
    });
    response.json(companies);
}
async function getCompany(request, response) {
    const company = await prisma_js_1.prisma.company.findUnique({
        where: { id: (0, route_param_js_1.routeParam)(request, "id") },
        include: companyInclude
    });
    if (!company)
        throw new error_handler_js_1.ApiError(404, "Company not found");
    response.json(company);
}
async function createCompany(request, response) {
    const data = schemas_js_1.companyCreateSchema.parse(request.body);
    const company = await prisma_js_1.prisma.company.create({ data });
    response.status(201).json(company);
}
async function updateCompany(request, response) {
    const data = schemas_js_1.companyUpdateSchema.parse(request.body);
    const company = await prisma_js_1.prisma.company.update({ where: { id: (0, route_param_js_1.routeParam)(request, "id") }, data });
    response.json(company);
}
async function deleteCompany(request, response) {
    await prisma_js_1.prisma.company.delete({ where: { id: (0, route_param_js_1.routeParam)(request, "id") } });
    response.status(204).send();
}
