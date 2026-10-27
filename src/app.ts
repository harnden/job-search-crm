import cors from "cors";
import express from "express";
import helmet from "helmet";
import { activitiesRouter } from "./routes/activities.js";
import { applicationsRouter } from "./routes/applications.js";
import { companiesRouter } from "./routes/companies.js";
import { contactsRouter } from "./routes/contacts.js";
import { parserRouter } from "./routes/parser.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/companies", companiesRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/parser", parserRouter);

app.use(notFoundHandler);
app.use(errorHandler);
