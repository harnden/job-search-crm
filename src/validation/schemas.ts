import { ActivityType, ApplicationStatus, CompanyTier } from "@prisma/client";
import { z } from "zod";

export const jobSpecSchema = z.object({
  rawText: z.string().trim().min(1, "Job specification text is required")
}).strict();

const optionalNullableString = z.string().trim().min(1).nullable().optional();
const optionalDate = z.coerce.date().nullable().optional();
const companyTier = z.preprocess(
  (value) => value === null || value === "" ? CompanyTier.Target : value,
  z.nativeEnum(CompanyTier).default(CompanyTier.Target)
);

export const companyCreateSchema = z.object({
  name: z.string().trim().min(1),
  domain: optionalNullableString,
  tier: companyTier,
  notes: optionalNullableString
}).strict();

export const companyUpdateSchema = companyCreateSchema.partial();

export const contactCreateSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().min(1).nullable().optional(),
  lastContactDate: optionalDate,
  nextFollowUpDate: optionalDate
}).strict();

export const contactUpdateSchema = contactCreateSchema.partial();

const applicationPayloadSchema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  jobTitle: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  companyName: z.string().trim().optional(),
  location: z.string().trim().nullable().optional(),
  jobUrl: z.string().url().nullable().optional(),
  description: optionalNullableString,
  notes: z.string().trim().nullable().optional(),
  salaryTarget: z.coerce.number().int().nonnegative().nullable().optional(),
  status: z.nativeEnum(ApplicationStatus),
  discoveredDate: optionalDate,
  appliedDate: optionalDate
}).passthrough();

export const applicationCreateSchema = applicationPayloadSchema
  .superRefine((data, context) => {
    if (!data.jobTitle && !data.title) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["jobTitle"], message: "Job title is required" });
    }
  })
  .transform((data) => ({ ...data, jobTitle: data.jobTitle || data.title }));

export const applicationUpdateSchema = z.object({
  companyId: z.string().uuid().optional(),
  jobTitle: z.string().trim().min(1).optional(),
  companyName: z.string().trim().min(1).optional(),
  location: z.string().trim().nullable().optional(),
  jobUrl: z.string().url().nullable().optional(),
  description: optionalNullableString,
  notes: z.string().trim().nullable().optional(),
  salaryTarget: z.coerce.number().int().nonnegative().nullable().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  discoveredDate: optionalDate,
  appliedDate: optionalDate
}).strict();

export const applicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  appliedDate: optionalDate
}).strict();

export const applicationActionItemCreateSchema = z.object({
  title: z.string().trim().min(1).max(120)
}).strict();

export const applicationActionItemUpdateSchema = z.object({
  completed: z.boolean()
}).strict();

export const activityCreateSchema = z.object({
  applicationId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  type: z.nativeEnum(ActivityType),
  notes: z.string().trim().min(1),
  timestamp: z.coerce.date().optional()
}).strict().refine((value) => Boolean(value.applicationId) !== Boolean(value.contactId), {
  message: "Provide exactly one of applicationId or contactId",
  path: ["applicationId"]
});

export type CompanyCreate = z.infer<typeof companyCreateSchema>;
export type ContactCreate = z.infer<typeof contactCreateSchema>;
export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;
export type ActivityCreate = z.infer<typeof activityCreateSchema>;
