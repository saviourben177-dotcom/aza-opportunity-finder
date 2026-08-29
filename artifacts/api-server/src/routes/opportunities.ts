import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, opportunitiesTable, savedOpportunitiesTable } from "@workspace/db";
import {
  AnalyzeOpportunitiesBody,
  AnalyzeOpportunitiesResponse,
  AiMatchBody,
  AiMatchResponse,
  GetOpportunityParams,
  GetSavedOpportunitiesQueryParams,
  SaveOpportunityBody,
  UnsaveOpportunityParams,
  UnsaveOpportunityBody,
} from "@workspace/api-zod";

type Profile = ReturnType<typeof AnalyzeOpportunitiesBody.parse>;
type Opportunity = {
  id: string;
  title: string;
  organization: string;
  description: string;
  category: string;
  tags: string[];
  eligibleCountries: string[];
  minAge: number;
  maxAge: number;
  educationRequirements: string[];
  studentRequirement: string;
  skills: string[];
  travelRequirement: "none" | "local" | "international";
  onlineAvailability: boolean;
  funding: string;
  applicationCost: number;
  deadline: string;
  requiredDocuments: string[];
  applicationUrl: string;
  status: "open" | "closing-soon";
  source: string;
  verificationDate: string;
  demoData: boolean;
};

type OpportunityMatch = Opportunity & {
  score: number;
  eligibility: "eligible" | "potential" | "ineligible";
  eligibleReasons: string[];
  concernReasons: string[];
  missingRequirements: string[];
  nextActions: string[];
  daysRemaining: number;
};

// Real opportunity data lives in Postgres (public.opportunities), not a
// hardcoded array. Rows are mapped into the exact `Opportunity` shape the
// rest of this file (and the API contract) expects. Dates come back from
// the pg driver as `Date` objects for `date` columns; they're normalised to
// `YYYY-MM-DD` strings here since `daysUntil`, the response schema, and the
// frontend all expect ISO date strings, not Date instances.
function toIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

function rowToOpportunity(row: typeof opportunitiesTable.$inferSelect): Opportunity {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    description: row.description,
    category: row.category,
    tags: row.tags,
    eligibleCountries: row.eligibleCountries,
    minAge: row.minAge,
    maxAge: row.maxAge,
    educationRequirements: row.educationRequirements,
    studentRequirement: row.studentRequirement,
    skills: row.skills,
    travelRequirement: row.travelRequirement as Opportunity["travelRequirement"],
    onlineAvailability: row.onlineAvailability,
    funding: row.funding,
    applicationCost: row.applicationCost,
    deadline: toIsoDate(row.deadline),
    requiredDocuments: row.requiredDocuments,
    applicationUrl: row.applicationUrl,
    status: row.status as Opportunity["status"],
    source: row.source,
    verificationDate: toIsoDate(row.verificationDate),
    demoData: row.demoData,
  };
}

async function getAllOpportunities(): Promise<Opportunity[]> {
  const rows = await db.select().from(opportunitiesTable);
  return rows.map(rowToOpportunity);
}

async function getOpportunityById(id: string): Promise<Opportunity | undefined> {
  const rows = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, id))
    .limit(1);
  return rows[0] ? rowToOpportunity(rows[0]) : undefined;
}


// Guards against malformed data from ingestion sources (e.g. a source API
// nesting an array where a plain string was expected). Without this, one
// bad opportunity record throws inside analyze() and 500s the whole
// /opportunities/analyze response for every user, not just that record.
const normalise = (value: unknown): string =>
  Array.isArray(value) ? value.map(normalise).join(" ") : String(value ?? "").trim().toLowerCase();
// Deliberately not clamped to 0: the frontend relies on a negative value to
// know a deadline has passed (shows "Closed" and disables the apply button).
// Clamping here would make every closed opportunity read as "Closes today"
// forever.
const daysUntil = (date: string) =>
  Math.ceil((Date.parse(`${date}T23:59:59Z`) - Date.now()) / 86_400_000);

// Profiles are free text ("Nigeria") while opportunity data uses ISO 3166-1
// alpha-2 codes ("NG"). Without this, every match on a typed-out country
// name incorrectly hard-blocks as ineligible.
const COUNTRY_ALIASES: Record<string, string> = {
  nigeria: "ng",
  ng: "ng",
  ghana: "gh",
  gh: "gh",
  kenya: "ke",
  ke: "ke",
  "south africa": "za",
  za: "za",
  rwanda: "rw",
  rw: "rw",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  us: "us",
  "united kingdom": "gb",
  uk: "gb",
  gb: "gb",
  britain: "gb",
  "great britain": "gb",
};
const normaliseCountry = (value: string) => {
  const key = normalise(value);
  return COUNTRY_ALIASES[key] ?? key;
};

// A skill area is broader than any single word a profile might use for it.
// This is a fixed, declared list of related terms — not fuzzy or
// probabilistic matching — so someone who writes "React, Node.js" is
// recognised against an opportunity asking for "software engineering", and
// the reasons shown to the user stay accurate to what was actually typed.
const RELATED_TERMS: Record<string, string[]> = {
  "software engineering": [
    "javascript", "typescript", "react", "node", "python", "java", "coding",
    "programming", "software", "developer", "engineering", "web development",
    "app development", "full stack", "backend", "frontend",
  ],
  javascript: ["react", "node", "typescript", "vue", "next.js", "express"],
  python: ["django", "flask", "pandas", "numpy", "data science"],
  "data analysis": ["data science", "sql", "pandas", "statistics", "analytics"],
  "artificial intelligence": ["ai", "machine learning", "ml", "deep learning", "llm"],
  design: ["ui", "ux", "figma", "graphic design", "visual design"],
  "product design": ["ui", "ux", "figma", "product management", "prototyping"],
  research: ["analysis", "writing", "investigation"],
  github: ["git", "open source", "version control"],
  "technical writing": ["documentation", "writing", "content"],
};

function analyze(opportunity: Opportunity, profile: Profile): OpportunityMatch {
  const eligibleReasons: string[] = [];
  const concernReasons: string[] = [];
  const missingRequirements: string[] = [];
  const nextActions: string[] = [];
  let score = 0;

  const countryMatches = opportunity.eligibleCountries.some(
    (country) => normaliseCountry(country) === normaliseCountry(profile.country),
  );
  if (countryMatches) {
    score += 25;
    eligibleReasons.push(`${profile.country.trim()} is listed in the eligible countries.`);
  } else {
    concernReasons.push(`This opportunity does not list ${profile.country} as eligible.`);
  }

  if (profile.age >= opportunity.minAge && profile.age <= opportunity.maxAge) {
    score += 20;
    eligibleReasons.push(
      `Age requirement: ${opportunity.minAge}–${opportunity.maxAge}; you are ${profile.age}.`,
    );
  } else {
    concernReasons.push(
      `Age requirement is ${opportunity.minAge}–${opportunity.maxAge}; your profile says ${profile.age}.`,
    );
  }

  const educationMatches = opportunity.educationRequirements.includes(profile.education);
  if (educationMatches) {
    score += 15;
    eligibleReasons.push(`Your ${profile.education} education level is accepted.`);
  } else {
    missingRequirements.push(`Education level: ${opportunity.educationRequirements.join(", ")}.`);
  }

  const studentMatches =
    opportunity.studentRequirement === "any" || opportunity.studentRequirement === profile.status;
  if (studentMatches) {
    score += 10;
    if (opportunity.studentRequirement !== "any") {
      eligibleReasons.push("Your current student status matches the requirement.");
    }
  } else {
    missingRequirements.push(`Current status: must be ${opportunity.studentRequirement}.`);
  }

  const profileText = [...profile.interests, ...profile.skills, profile.goals]
    .join(" ")
    .toLowerCase();
  const matchedSkills = opportunity.skills.filter((skill) => {
    const skillKey = normalise(skill);
    if (profileText.includes(skillKey)) return true;
    // A skill counts as matched if the profile mentions a concrete
    // technology or practice commonly associated with it. This is a fixed,
    // declared list — not fuzzy or probabilistic matching — so the reasons
    // shown to the user stay accurate and explainable.
    const related = RELATED_TERMS[skillKey];
    return related?.some((term) => profileText.includes(term)) ?? false;
  });
  if (matchedSkills.length > 0) {
    score += Math.min(20, matchedSkills.length * 7);
    eligibleReasons.push(`Matches your interests or skills: ${matchedSkills.slice(0, 3).join(", ")}.`);
  } else {
    concernReasons.push("The opportunity's focus is not strongly represented in your profile yet.");
  }

  if (opportunity.applicationCost <= profile.budget) {
    score += 5;
    eligibleReasons.push(opportunity.applicationCost === 0 ? "No application fee." : "Application fee fits your budget.");
  } else {
    missingRequirements.push(`Application cost: ${opportunity.applicationCost} exceeds your budget.`);
  }

  const travelOk =
    opportunity.travelRequirement === "none" ||
    (opportunity.travelRequirement === "local" && profile.localTravel) ||
    (opportunity.travelRequirement === "international" && profile.internationalTravel);
  if (travelOk) {
    score += 5;
    eligibleReasons.push(
      opportunity.travelRequirement === "none"
        ? "Online participation means no travel is required."
        : `${opportunity.travelRequirement === "local" ? "Local" : "International"} travel is compatible with your profile.`,
    );
  } else {
    concernReasons.push(
      opportunity.travelRequirement === "international"
        ? "An international trip is required, but your profile says you cannot travel internationally."
        : "A local in-person component is required, but local travel is unavailable.",
    );
  }

  const preferred = profile.preferredTypes.map(normalise);
  const categoryMatch = preferred.some((type) => normalise(opportunity.category).includes(type) || type.includes(normalise(opportunity.category)));
  if (categoryMatch) {
    score += 5;
    eligibleReasons.push(`Matches your preferred opportunity type: ${opportunity.category}.`);
  }

  const daysRemaining = daysUntil(opportunity.deadline);
  if (daysRemaining <= 14) {
    concernReasons.push(`Deadline is close: ${daysRemaining} days remaining.`);
  } else {
    eligibleReasons.push(`${daysRemaining} days remaining to apply.`);
  }

  const hardBlock = !countryMatches || profile.age < opportunity.minAge || profile.age > opportunity.maxAge;
  const softBlock = !educationMatches || !studentMatches || !travelOk || opportunity.applicationCost > profile.budget;
  const eligibility = hardBlock ? "ineligible" : softBlock ? "potential" : "eligible";

  if (eligibility === "eligible") {
    nextActions.push("Open the application and confirm the latest requirements.");
    nextActions.push(`Prepare: ${opportunity.requiredDocuments.slice(0, 2).join(" and ")}.`);
  } else if (eligibility === "potential") {
    nextActions.push("Resolve the missing requirements before investing time in the application.");
    nextActions.push(`Prepare: ${opportunity.requiredDocuments.slice(0, 2).join(" and ")}.`);
  } else {
    nextActions.push("Keep this saved only if your profile changes; focus on eligible opportunities first.");
  }

  return {
    ...opportunity,
    score: Math.min(100, score),
    eligibility,
    eligibleReasons,
    concernReasons,
    missingRequirements,
    nextActions,
    daysRemaining,
  };
}

const router: IRouter = Router();

router.post("/opportunities/analyze", async (req, res) => {
  const parsed = AnalyzeOpportunitiesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete the profile with valid values." });
    return;
  }

  const allOpportunities = await getAllOpportunities();
  const matches = allOpportunities
    .map((opportunity) => analyze(opportunity, parsed.data))
    .sort((a, b) => b.score - a.score || a.daysRemaining - b.daysRemaining);
  const result = {
    total: matches.length,
    eligibleCount: matches.filter((match) => match.eligibility === "eligible").length,
    potentialCount: matches.filter((match) => match.eligibility === "potential").length,
    ineligibleCount: matches.filter((match) => match.eligibility === "ineligible").length,
    matches,
  };

  const validated = AnalyzeOpportunitiesResponse.parse(result);
  req.log.info({ profileCountry: parsed.data.country, resultCount: matches.length }, "Aza opportunity analysis completed");
  res.json(validated);
});

// AI Match reuses the exact same deterministic scoring as /opportunities/analyze
// above — it does not let the model invent opportunities or eligibility. The
// LLM's only job is to turn the top already-scored, already-real matches into
// a short, personalized narrative. If GROQ_API_KEY is missing or the Groq
// call fails, this returns 503 rather than silently falling back to fake
// text, so a broken key is loud in the logs and in the response, not hidden.
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

router.post("/opportunities/ai-match", async (req, res) => {
  const parsed = AiMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete the profile with valid values." });
    return;
  }

  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    req.log.error("AI Match called but GROQ_API_KEY is not set");
    res.status(503).json({ error: "AI Match is not configured yet." });
    return;
  }

  const allOpportunities = await getAllOpportunities();
  const scored = allOpportunities
    .map((opportunity) => analyze(opportunity, parsed.data))
    .filter((match) => match.eligibility !== "ineligible")
    .sort((a, b) => b.score - a.score || a.daysRemaining - b.daysRemaining)
    .slice(0, 8);

  if (scored.length === 0) {
    res.json({
      summary: "No eligible or potential opportunities matched this profile yet. Try widening your interests or preferred types.",
      highlights: [],
      generatedAt: new Date().toISOString(),
    });
    return;
  }

  // Only the fields the model needs to reason about are sent — never the
  // full opportunity object — to keep the prompt small and to make it
  // structurally impossible for the model to echo back a field (like a
  // fabricated applicationUrl) that wasn't given to it.
  const candidateSummaries = scored.map((match) => ({
    id: match.id,
    title: match.title,
    organization: match.organization,
    category: match.category,
    eligibility: match.eligibility,
    score: match.score,
    eligibleReasons: match.eligibleReasons,
    concernReasons: match.concernReasons,
    daysRemaining: match.daysRemaining,
  }));

  const systemPrompt =
    "You are Aza's opportunity-matching assistant. You will be given a student's profile and a fixed list of already-verified, already-scored opportunities. " +
    "Write a short, warm, specific explanation of why the top matches fit this person. " +
    "Rules: only reference opportunities from the provided list by their exact id and title. Never invent an opportunity, organization, deadline, or URL that isn't in the list. " +
    "Never state or imply a numeric probability of acceptance. " +
    "Respond ONLY with JSON matching this exact shape, no markdown, no preamble: " +
    '{"summary": string, "highlights": [{"opportunityId": string, "title": string, "whyItFits": string}]}. ' +
    "Include at most 5 highlights, ordered best-fit first.";

  const userPrompt = JSON.stringify({
    profile: {
      country: parsed.data.country,
      status: parsed.data.status,
      education: parsed.data.education,
      interests: parsed.data.interests,
      skills: parsed.data.skills,
      goals: parsed.data.goals,
      preferredTypes: parsed.data.preferredTypes,
    },
    candidates: candidateSummaries,
  });

  let groqResponse: Response;
  try {
    groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 900,
        response_format: { type: "json_object" },
      }),
    });
  } catch (err) {
    req.log.error({ err }, "AI Match: Groq request failed to send");
    res.status(503).json({ error: "AI Match is temporarily unavailable. Please try again shortly." });
    return;
  }

  if (!groqResponse.ok) {
    const errorBody = await groqResponse.text().catch(() => "");
    req.log.error({ status: groqResponse.status, errorBody }, "AI Match: Groq returned an error");
    res.status(503).json({ error: "AI Match is temporarily unavailable. Please try again shortly." });
    return;
  }

  const groqJson = await groqResponse.json();
  const rawContent: string | undefined = groqJson?.choices?.[0]?.message?.content;
  if (!rawContent) {
    req.log.error({ groqJson }, "AI Match: Groq response had no content");
    res.status(503).json({ error: "AI Match is temporarily unavailable. Please try again shortly." });
    return;
  }

  let modelOutput: { summary?: string; highlights?: { opportunityId?: string; title?: string; whyItFits?: string }[] };
  try {
    modelOutput = JSON.parse(rawContent);
  } catch (err) {
    req.log.error({ err, rawContent }, "AI Match: Groq response was not valid JSON");
    res.status(503).json({ error: "AI Match is temporarily unavailable. Please try again shortly." });
    return;
  }

  // Never trust the model's echoed ids/titles at face value: only keep
  // highlights that reference an opportunity actually in the scored,
  // real candidate list, and always use Aza's own title for it, not
  // whatever the model wrote.
  const scoredById = new Map(scored.map((match) => [match.id, match]));
  const safeHighlights = (modelOutput.highlights ?? [])
    .filter((highlight) => highlight.opportunityId && scoredById.has(highlight.opportunityId))
    .slice(0, 5)
    .map((highlight) => {
      const real = scoredById.get(highlight.opportunityId as string)!;
      return {
        opportunityId: real.id,
        title: real.title,
        whyItFits: (highlight.whyItFits ?? "").trim() || `Matches your profile with a score of ${real.score}/100.`,
      };
    });

  const result = {
    summary: (modelOutput.summary ?? "").trim() || "Here are the opportunities that best match your profile.",
    highlights: safeHighlights,
    generatedAt: new Date().toISOString(),
  };

  const validated = AiMatchResponse.parse(result);
  req.log.info({ profileCountry: parsed.data.country, highlightCount: safeHighlights.length }, "Aza AI Match completed");
  res.json(validated);
});

router.get("/opportunities/:id", async (req, res) => {
  const parsed = GetOpportunityParams.safeParse(req.params);
  const opportunity = parsed.success ? await getOpportunityById(parsed.data.id) : undefined;
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found." });
    return;
  }

  const demoProfile = {
    age: 16,
    country: "NG",
    region: "Lagos",
    status: "student" as const,
    education: "secondary" as const,
    interests: ["software engineering"],
    skills: ["javascript"],
    goals: "Build useful software",
    budget: 0,
    internationalTravel: false,
    localTravel: false,
    preferredTypes: ["hackathon"],
  };
  res.json(analyze(opportunity, demoProfile));
});

// "Saved" is scoped by an anonymous device ID (a UUID generated and stored
// client-side), not a signed-in account — the app has no auth yet. This is
// real persistence, not a stub: it survives reloads and syncs across the
// same device, it just doesn't follow a person across devices until real
// accounts exist.
router.get("/saved", async (req, res) => {
  const parsed = GetSavedOpportunitiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "deviceId is required." });
    return;
  }

  const rows = await db
    .select({ opportunity: opportunitiesTable })
    .from(savedOpportunitiesTable)
    .innerJoin(opportunitiesTable, eq(savedOpportunitiesTable.opportunityId, opportunitiesTable.id))
    .where(eq(savedOpportunitiesTable.deviceId, parsed.data.deviceId));

  res.json({ opportunities: rows.map((row) => rowToOpportunity(row.opportunity)) });
});

router.post("/saved", async (req, res) => {
  const parsed = SaveOpportunityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "deviceId and opportunityId are required." });
    return;
  }

  const opportunity = await getOpportunityById(parsed.data.opportunityId);
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found." });
    return;
  }

  await db
    .insert(savedOpportunitiesTable)
    .values({ deviceId: parsed.data.deviceId, opportunityId: parsed.data.opportunityId })
    .onConflictDoNothing({
      target: [savedOpportunitiesTable.deviceId, savedOpportunitiesTable.opportunityId],
    });

  res.json({ saved: true });
});

router.delete("/saved/:opportunityId", async (req, res) => {
  const paramsParsed = UnsaveOpportunityParams.safeParse(req.params);
  const bodyParsed = UnsaveOpportunityBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "deviceId and opportunityId are required." });
    return;
  }

  await db
    .delete(savedOpportunitiesTable)
    .where(
      and(
        eq(savedOpportunitiesTable.deviceId, bodyParsed.data.deviceId),
        eq(savedOpportunitiesTable.opportunityId, paramsParsed.data.opportunityId),
      ),
    );

  res.json({ removed: true });
});

export default router;