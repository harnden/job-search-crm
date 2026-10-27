import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { routeParam } from "../lib/route-param.js";
import { ApiError } from "../middleware/error-handler.js";
import { contactCreateSchema, contactUpdateSchema } from "../validation/schemas.js";

export async function listContacts(request: Request, response: Response) {
  const upcomingFollowUps = request.query.upcomingFollowUps === "true";
  const contacts = await prisma.contact.findMany({
    where: upcomingFollowUps
      ? { nextFollowUpDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }
      : undefined,
    include: { company: true },
    orderBy: [{ nextFollowUpDate: "asc" }, { name: "asc" }]
  });
  response.json(contacts);
}

export async function getContact(request: Request, response: Response) {
  const contact = await prisma.contact.findUnique({
    where: { id: routeParam(request, "id") },
    include: { company: true, activities: { orderBy: { timestamp: "desc" } } }
  });
  if (!contact) throw new ApiError(404, "Contact not found");
  response.json(contact);
}

export async function createContact(request: Request, response: Response) {
  const data = contactCreateSchema.parse(request.body);
  const contact = await prisma.contact.create({ data });
  response.status(201).json(contact);
}

export async function updateContact(request: Request, response: Response) {
  const data = contactUpdateSchema.parse(request.body);
  const contact = await prisma.contact.update({ where: { id: routeParam(request, "id") }, data });
  response.json(contact);
}

export async function deleteContact(request: Request, response: Response) {
  await prisma.contact.delete({ where: { id: routeParam(request, "id") } });
  response.status(204).send();
}
