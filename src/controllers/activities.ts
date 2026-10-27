import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { activityCreateSchema } from "../validation/schemas.js";

export async function listActivities(request: Request, response: Response) {
  const activities = await prisma.activity.findMany({
    where: {
      applicationId: typeof request.query.applicationId === "string" ? request.query.applicationId : undefined,
      contactId: typeof request.query.contactId === "string" ? request.query.contactId : undefined
    },
    include: { application: true, contact: true },
    orderBy: { timestamp: "desc" }
  });
  response.json(activities);
}

export async function createActivity(request: Request, response: Response) {
  const data = activityCreateSchema.parse(request.body);
  const activity = await prisma.activity.create({ data });
  response.status(201).json(activity);
}
