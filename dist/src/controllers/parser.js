"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJobSpecController = parseJobSpecController;
const job_spec_parser_js_1 = require("../services/job-spec-parser.js");
const schemas_js_1 = require("../validation/schemas.js");
async function parseJobSpecController(request, response) {
    const { rawText } = schemas_js_1.jobSpecSchema.parse(request.body);
    const parsed = await (0, job_spec_parser_js_1.parseJobSpec)(rawText);
    response.json(parsed);
}
