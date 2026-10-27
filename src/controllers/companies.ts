import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { routeParam } from "../lib/route-param.js";
import { ApiError } from "../middleware/error-handler.js";
import { companyCreateSchema, companyUpdateSchema } from "../validation/schemas.js";

const companyInclude = { contacts: true, applications: true } as const;

export async function listCompanies(_request: Request, response: Response) {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { contacts: true, applications: true } } },
    orderBy: { name: "asc" }
  });
  response.json(companies);
}

export async function getCompany(request: Request, response: Response) {
  const company = await prisma.company.findUnique({
    where: { id: routeParam(request, "id") },
    include: companyInclude
  });
  if (!company) throw new ApiError(404, "Company not found");
  response.json(company);
}

export async function createCompany(request: Request, response: Response) {
  const data = companyCreateSchema.parse(request.body);
  const company = await prisma.company.create({ data });
  response.status(201).json(company);
}

export async function updateCompany(request: Request, response: Response) {
  const data = companyUpdateSchema.parse(request.body);
  const company = await prisma.company.update({ where: { id: routeParam(request, "id") }, data });
  response.json(company);
}

export async function deleteCompany(request: Request, response: Response) {
  await prisma.company.delete({ where: { id: routeParam(request, "id") } });
  response.status(204).send();
}
