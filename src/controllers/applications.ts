import type { Request, Response } from "express";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { routeParam } from "../lib/route-param.js";
import { ApiError } from "../middleware/error-handler.js";
import { applicationCreateSchema, applicationStatusSchema, applicationUpdateSchema } from "../validation/schemas.js";

export async function listApplications(_request: Request, response: Response) {
  const applications = await prisma.application.findMany({
    include: { company: true },
    orderBy: { updatedAt: "desc" }
  });
  response.json(applications);
}

export async function getApplication(request: Request, response: Response) {
  const application = await prisma.application.findUnique({
    where: { id: routeParam(request, "id") },
    include: { company: true, activities: { orderBy: { timestamp: "desc" } } }
  });
  if (!application) throw new ApiError(404, "Application not found");
  response.json(application);
}

export async function createApplication(request: Request, response: Response) {
  const data = applicationCreateSchema.parse(request.body);
  const { companyName: _companyName, location: _location, title: _title, ...parsed } = data;
  const jobTitle = parsed.jobTitle || request.body.title;
  const companyId = parsed.companyId || request.body.companyId;
  if (!companyId) throw new ApiError(400, "companyId is required");
  if (!jobTitle) throw new ApiError(400, "jobTitle or title is required");

  const application = await prisma.application.create({
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

export async function updateApplication(request: Request, response: Response) {
  const data = applicationUpdateSchema.parse(request.body);
  const application = await prisma.application.update({ where: { id: routeParam(request, "id") }, data });
  response.json(application);
}

export async function updateApplicationStatus(request: Request, response: Response) {
  const { status, appliedDate } = applicationStatusSchema.parse(request.body);
  const application = await prisma.application.update({
    where: { id: routeParam(request, "id") },
    data: { status: status as ApplicationStatus, ...(appliedDate !== undefined ? { appliedDate } : {}) }
  });
  response.json(application);
}

export async function deleteApplication(request: Request, response: Response) {
  try {
    await prisma.application.delete({ where: { id: routeParam(request, "id") } });
    response.status(204).send();
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  }
}
