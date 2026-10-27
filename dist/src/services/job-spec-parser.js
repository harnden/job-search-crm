"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJobSpec = parseJobSpec;
const EMPTY_RESULT = {
    companyName: null,
    jobTitle: null,
    salaryMin: null,
    salaryMax: null,
    keyRequirements: [],
    location: null,
    remoteStatus: null
};
function clean(value) {
    const result = value?.trim().replace(/\s+/g, " ");
    return result ? result : null;
}
function fieldValue(text, labels) {
    const pattern = new RegExp(`(?:^|\\n)\\s*(?:${labels.join("|")})\\s*[:\\-]\\s*(.+)`, "i");
    return clean(text.match(pattern)?.[1]);
}
function parseMoney(value) {
    const normalized = value.toLowerCase().replace(/,/g, "");
    const amount = Number.parseFloat(normalized.replace(/[$\s]/g, "").replace(/k$/, ""));
    return normalized.includes("k") ? amount * 1000 : amount;
}
function parseSalary(text) {
    const match = text.match(/(?:salary|compensation|pay|range)?[^\n$]{0,30}\$\s?\d[\d,]*(?:\.\d+)?\s*[kK]?\s*(?:-|–|—|to)\s*\$?\s?\d[\d,]*(?:\.\d+)?\s*[kK]?/i);
    if (!match)
        return { salaryMin: null, salaryMax: null };
    const amounts = match[0].match(/\$?\s?\d[\d,]*(?:\.\d+)?\s*[kK]?/g) ?? [];
    if (amounts.length < 2)
        return { salaryMin: null, salaryMax: null };
    const [minimum, maximum] = amounts;
    if (!minimum || !maximum)
        return { salaryMin: null, salaryMax: null };
    return { salaryMin: parseMoney(minimum), salaryMax: parseMoney(maximum) };
}
function parseRequirements(text) {
    const section = text.match(/(?:key requirements|requirements|qualifications|what you(?:'|’)ll bring)\s*:?\s*([\s\S]*?)(?=\n\s*(?:responsibilities|benefits|location|salary|compensation|about us|about the role)\s*:?|$)/i)?.[1];
    if (!section)
        return [];
    return section.split("\n").map((line) => line.replace(/^\s*(?:[-*•▪]|\d+[.)])\s*/, "").trim()).filter((line) => line.length > 2).slice(0, 12);
}
function fallbackParse(rawText) {
    const salary = parseSalary(rawText);
    const remoteMatch = rawText.match(/\b(remote|hybrid|on[- ]site|onsite|in office)\b/i);
    const location = fieldValue(rawText, ["location", "based in", "office"]);
    const remoteStatus = fieldValue(rawText, ["remote status", "work arrangement", "working arrangement"]) ?? clean(remoteMatch?.[1]);
    const firstLines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);
    return {
        ...EMPTY_RESULT,
        companyName: fieldValue(rawText, ["company name", "company", "employer"]),
        jobTitle: fieldValue(rawText, ["job title", "role", "position"]) ?? clean(firstLines.find((line) => /\b(manager|analyst|engineer|designer|director|specialist|lead|coordinator|developer)\b/i.test(line))),
        ...salary,
        keyRequirements: parseRequirements(rawText),
        location,
        remoteStatus
    };
}
function normalizeExternalResult(value) {
    if (!value || typeof value !== "object")
        return EMPTY_RESULT;
    const result = value;
    const numberOrNull = (input) => typeof input === "number" && Number.isFinite(input) ? input : null;
    return {
        companyName: typeof result.companyName === "string" ? clean(result.companyName) : null,
        jobTitle: typeof result.jobTitle === "string" ? clean(result.jobTitle) : null,
        salaryMin: numberOrNull(result.salaryMin),
        salaryMax: numberOrNull(result.salaryMax),
        keyRequirements: Array.isArray(result.keyRequirements) ? result.keyRequirements.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 12) : [],
        location: typeof result.location === "string" ? clean(result.location) : null,
        remoteStatus: typeof result.remoteStatus === "string" ? clean(result.remoteStatus) : null
    };
}
async function parseWithOpenAI(rawText, apiKey) {
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            input: `Extract structured job posting fields from the text below. Return only valid JSON with these keys: companyName (string or null), jobTitle (string or null), salaryMin (number or null), salaryMax (number or null), keyRequirements (array of strings), location (string or null), remoteStatus (string or null).\n\n${rawText}`,
            text: { format: { type: "json_object" } }
        })
    });
    if (!response.ok)
        throw new Error(`OpenAI parser request failed with ${response.status}`);
    const body = await response.json();
    const outputText = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).find((item) => item.text)?.text;
    if (!outputText)
        throw new Error("OpenAI parser returned no structured output");
    return normalizeExternalResult(JSON.parse(outputText));
}
async function parseJobSpec(rawText) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
        return fallbackParse(rawText);
    try {
        return await parseWithOpenAI(rawText, apiKey);
    }
    catch (error) {
        console.warn("OpenAI job spec parsing failed; using fallback parser.", error);
        return fallbackParse(rawText);
    }
}
