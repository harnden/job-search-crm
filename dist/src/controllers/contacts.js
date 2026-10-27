"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listContacts = listContacts;
exports.getContact = getContact;
exports.createContact = createContact;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
const prisma_js_1 = require("../lib/prisma.js");
const route_param_js_1 = require("../lib/route-param.js");
const error_handler_js_1 = require("../middleware/error-handler.js");
const schemas_js_1 = require("../validation/schemas.js");
async function listContacts(request, response) {
    const upcomingFollowUps = request.query.upcomingFollowUps === "true";
    const contacts = await prisma_js_1.prisma.contact.findMany({
        where: upcomingFollowUps
            ? { nextFollowUpDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }
            : undefined,
        include: { company: true },
        orderBy: [{ nextFollowUpDate: "asc" }, { name: "asc" }]
    });
    response.json(contacts);
}
async function getContact(request, response) {
    const contact = await prisma_js_1.prisma.contact.findUnique({
        where: { id: (0, route_param_js_1.routeParam)(request, "id") },
        include: { company: true, activities: { orderBy: { timestamp: "desc" } } }
    });
    if (!contact)
        throw new error_handler_js_1.ApiError(404, "Contact not found");
    response.json(contact);
}
async function createContact(request, response) {
    const data = schemas_js_1.contactCreateSchema.parse(request.body);
    const contact = await prisma_js_1.prisma.contact.create({ data });
    response.status(201).json(contact);
}
async function updateContact(request, response) {
    const data = schemas_js_1.contactUpdateSchema.parse(request.body);
    const contact = await prisma_js_1.prisma.contact.update({ where: { id: (0, route_param_js_1.routeParam)(request, "id") }, data });
    response.json(contact);
}
async function deleteContact(request, response) {
    await prisma_js_1.prisma.contact.delete({ where: { id: (0, route_param_js_1.routeParam)(request, "id") } });
    response.status(204).send();
}
