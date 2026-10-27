import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { createContact, deleteContact, getContact, listContacts, updateContact } from "../controllers/contacts.js";

export const contactsRouter = Router();
contactsRouter.get("/", asyncHandler(listContacts));
contactsRouter.get("/:id", asyncHandler(getContact));
contactsRouter.post("/", asyncHandler(createContact));
contactsRouter.put("/:id", asyncHandler(updateContact));
contactsRouter.delete("/:id", asyncHandler(deleteContact));
