"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityCreateSchema = exports.applicationStatusSchema = exports.applicationUpdateSchema = exports.applicationCreateSchema = exports.contactUpdateSchema = exports.contactCreateSchema = exports.companyUpdateSchema = exports.companyCreateSchema = exports.jobSpecSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.jobSpecSchema = zod_1.z.object({
    rawText: zod_1.z.string().trim().min(1, "Job specification text is required")
}).strict();
const optionalNullableString = zod_1.z.string().trim().min(1).nullable().optional();
const optionalDate = zod_1.z.coerce.date().nullable().optional();
const companyTier = zod_1.z.preprocess((value) => value === null || value === "" ? client_1.CompanyTier.Target : value, zod_1.z.nativeEnum(client_1.CompanyTier).default(client_1.CompanyTier.Target));
exports.companyCreateSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
    domain: optionalNullableString,
    tier: companyTier,
    notes: optionalNullableString
}).strict();
exports.companyUpdateSchema = exports.companyCreateSchema.partial();
exports.contactCreateSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid(),
    name: zod_1.z.string().trim().min(1),
    role: zod_1.z.string().trim().min(1),
    email: zod_1.z.string().email().nullable().optional(),
    phone: zod_1.z.string().trim().min(1).nullable().optional(),
    lastContactDate: optionalDate,
    nextFollowUpDate: optionalDate
}).strict();
exports.contactUpdateSchema = exports.contactCreateSchema.partial();
const applicationPayloadSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid().nullable().optional(),
    jobTitle: zod_1.z.string().trim().min(1).optional(),
    title: zod_1.z.string().trim().min(1).optional(),
    companyName: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().optional(),
    jobUrl: zod_1.z.string().url().nullable().optional(),
    description: optionalNullableString,
    salaryTarget: zod_1.z.coerce.number().int().nonnegative().nullable().optional(),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus),
    discoveredDate: optionalDate,
    appliedDate: optionalDate
}).passthrough();
exports.applicationCreateSchema = applicationPayloadSchema
    .superRefine((data, context) => {
    if (!data.jobTitle && !data.title) {
        context.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ["jobTitle"], message: "Job title is required" });
    }
})
    .transform((data) => ({ ...data, jobTitle: data.jobTitle || data.title }));
exports.applicationUpdateSchema = zod_1.z.object({
    companyId: zod_1.z.string().uuid().optional(),
    jobTitle: zod_1.z.string().trim().min(1).optional(),
    jobUrl: zod_1.z.string().url().nullable().optional(),
    description: optionalNullableString,
    salaryTarget: zod_1.z.coerce.number().int().nonnegative().nullable().optional(),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus).optional(),
    discoveredDate: optionalDate,
    appliedDate: optionalDate
}).strict();
exports.applicationStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus),
    appliedDate: optionalDate
}).strict();
exports.activityCreateSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid().optional(),
    contactId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.nativeEnum(client_1.ActivityType),
    notes: zod_1.z.string().trim().min(1),
    timestamp: zod_1.z.coerce.date().optional()
}).strict().refine((value) => Boolean(value.applicationId) !== Boolean(value.contactId), {
    message: "Provide exactly one of applicationId or contactId",
    path: ["applicationId"]
});
