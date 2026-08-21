import { Router, type IRouter } from "express";
import {
  AnalyzeOpportunitiesBody,
  AnalyzeOpportunitiesResponse,
  GetOpportunityParams,
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

const opportunities: Opportunity[] = [
  {
    id: "lagos-build-weekend",
    title: "Lagos Build Weekend",
    organization: "Aza Demo Collective",
    description:
      "A 48-hour online-first build sprint for young makers turning a local problem into a working prototype.",
    category: "Hackathon",
    tags: ["software engineering", "product", "community"],
    eligibleCountries: ["NG"],
    minAge: 15,
    maxAge: 26,
    educationRequirements: ["secondary", "undergraduate"],
    studentRequirement: "student",
    skills: ["software engineering", "javascript", "product design"],
    travelRequirement: "none",
    onlineAvailability: true,
    funding: "₦300,000 prototype grants + mentorship",
    applicationCost: 0,
    deadline: "2026-09-06",
    requiredDocuments: ["Short idea statement", "Portfolio or GitHub link"],
    applicationUrl: "/demo-applications/lagos-build-weekend",
    status: "open",
    source: "Aza Demo Collective",
    verificationDate: "2026-08-18",
    demoData: true,
  },
  {
    id: "open-source-scholars",
    title: "Open Source Scholars",
    organization: "Aza Demo Foundation",
    description:
      "A guided 10-week program pairing students with open-source maintainers to ship their first meaningful contribution.",
    category: "Fellowship",
    tags: ["software engineering", "open source", "career"],
    eligibleCountries: ["NG", "GH", "KE", "ZA"],
    minAge: 16,
    maxAge: 30,
    educationRequirements: ["secondary", "undergraduate", "graduate"],
    studentRequirement: "student",
    skills: ["software engineering", "github", "technical writing"],
    travelRequirement: "none",
    onlineAvailability: true,
    funding: "Fully funded stipend of $500",
    applicationCost: 0,
    deadline: "2026-09-12",
    requiredDocuments: ["CV", "Why open source essay", "One code sample"],
    applicationUrl: "/demo-applications/open-source-scholars",
    status: "open",
    source: "Aza Demo Foundation",
    verificationDate: "2026-08-15",
    demoData: true,
  },
  {
    id: "africa-creative-grant",
    title: "Africa Creative Technology Grant",
    organization: "Aza Demo Arts Lab",
    description:
      "Small grants for African creators building tools where culture, design, and technology meet.",
    category: "Grant",
    tags: ["design", "technology", "creative"],
    eligibleCountries: ["NG", "GH", "KE", "ZA", "RW"],
    minAge: 18,
    maxAge: 40,
    educationRequirements: ["secondary", "undergraduate", "graduate", "postgraduate"],
    studentRequirement: "any",
    skills: ["design", "research", "product design"],
    travelRequirement: "none",
    onlineAvailability: true,
    funding: "$2,500 project grant",
    applicationCost: 0,
    deadline: "2026-09-28",
    requiredDocuments: ["Project proposal", "Budget", "Work samples"],
    applicationUrl: "/demo-applications/creative-grant",
    status: "open",
    source: "Aza Demo Arts Lab",
    verificationDate: "2026-08-17",
    demoData: true,
  },
  {
    id: "global-youth-cup",
    title: "Global Youth Innovation Cup",
    organization: "Aza Demo Ventures",
    description:
      "A global competition for youth-led solutions, with a final showcase hosted in Amsterdam.",
    category: "Competition",
    tags: ["innovation", "pitching", "social impact"],
    eligibleCountries: ["NG", "GH", "KE", "ZA", "RW", "US", "GB"],
    minAge: 18,
    maxAge: 25,
    educationRequirements: ["secondary", "undergraduate"],
    studentRequirement: "student",
    skills: ["product", "pitching", "research"],
    travelRequirement: "international",
    onlineAvailability: false,
    funding: "€10,000 prize + finalist travel support",
    applicationCost: 0,
    deadline: "2026-09-19",
    requiredDocuments: ["Team profile", "90-second pitch video", "Prototype link"],
    applicationUrl: "/demo-applications/global-youth-cup",
    status: "open",
    source: "Aza Demo Ventures",
    verificationDate: "2026-08-16",
    demoData: true,
  },
  {
    id: "remote-data-internship",
    title: "Remote Data Product Internship",
    organization: "Aza Demo Labs",
    description:
      "A paid, remote internship for emerging builders interested in using data to improve everyday products.",
    category: "Internship",
    tags: ["data", "software engineering", "product"],
    eligibleCountries: ["NG", "GH", "KE", "ZA"],
    minAge: 18,
    maxAge: 32,
    educationRequirements: ["undergraduate", "graduate", "postgraduate"],
    studentRequirement: "any",
    skills: ["data analysis", "python", "software engineering"],
    travelRequirement: "none",
    onlineAvailability: true,
    funding: "Paid, 12-week remote placement",
    applicationCost: 0,
    deadline: "2026-08-31",
    requiredDocuments: ["CV", "Transcript or equivalent", "Portfolio"],
    applicationUrl: "/demo-applications/remote-data-internship",
    status: "closing-soon",
    source: "Aza Demo Labs",
    verificationDate: "2026-08-18",
    demoData: true,
  },
  {
    id: "maker-microgrant",
    title: "Maker Microgrant",
    organization: "Aza Demo Community Fund",
    description:
      "A lightweight microgrant for early prototypes that can be tested in a local community within 30 days.",
    category: "Grant",
    tags: ["making", "community", "software engineering"],
    eligibleCountries: ["NG"],
    minAge: 13,
    maxAge: 35,
    educationRequirements: ["secondary", "undergraduate", "graduate"],
    studentRequirement: "any",
    skills: ["software engineering", "making", "community"],
    travelRequirement: "local",
    onlineAvailability: true,
    funding: "₦150,000 microgrant",
    applicationCost: 0,
    deadline: "2026-09-02",
    requiredDocuments: ["One-page project plan", "Community partner confirmation"],
    applicationUrl: "/demo-applications/maker-microgrant",
    status: "open",
    source: "Aza Demo Community Fund",
    verificationDate: "2026-08-14",
    demoData: true,
  },
  {
    id: "women-in-ai-lab",
    title: "Women in AI Lab Residency",
    organization: "Aza Demo Research Network",
    description:
      "A research residency for women exploring responsible AI, with a funded in-person lab week in Berlin.",
    category: "Program",
    tags: ["artificial intelligence", "research", "software engineering"],
    eligibleCountries: ["NG", "GH", "KE", "ZA", "RW"],
    minAge: 21,
    maxAge: 45,
    educationRequirements: ["graduate", "postgraduate"],
    studentRequirement: "any",
    skills: ["artificial intelligence", "research", "python"],
    travelRequirement: "international",
    onlineAvailability: true,
    funding: "€4,000 stipend + travel support",
    applicationCost: 0,
    deadline: "2026-10-05",
    requiredDocuments: ["Research proposal", "CV", "Two references"],
    applicationUrl: "/demo-applications/women-in-ai-lab",
    status: "open",
    source: "Aza Demo Research Network",
    verificationDate: "2026-08-12",
    demoData: true,
  },
  {
    id: "junior-design-challenge",
    title: "Junior Product Design Challenge",
    organization: "Aza Demo Studio",
    description:
      "A two-week design challenge for students to rethink a familiar everyday experience and present their thinking.",
    category: "Competition",
    tags: ["design", "product design", "research"],
    eligibleCountries: ["NG", "GH", "KE", "ZA", "RW", "US", "GB"],
    minAge: 13,
    maxAge: 22,
    educationRequirements: ["secondary", "undergraduate"],
    studentRequirement: "student",
    skills: ["design", "product design", "research"],
    travelRequirement: "none",
    onlineAvailability: true,
    funding: "Mentorship + design tool credits",
    applicationCost: 0,
    deadline: "2026-09-09",
    requiredDocuments: ["One case study or sketchbook", "Short motivation note"],
    applicationUrl: "/demo-applications/junior-design-challenge",
    status: "open",
    source: "Aza Demo Studio",
    verificationDate: "2026-08-18",
    demoData: true,
  },
];

const normalise = (value: string) => value.trim().toLowerCase();
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

router.post("/opportunities/analyze", (req, res) => {
  const parsed = AnalyzeOpportunitiesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete the profile with valid values." });
    return;
  }

  const matches = opportunities
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

router.get("/opportunities/:id", (req, res) => {
  const parsed = GetOpportunityParams.safeParse(req.params);
  const opportunity = parsed.success ? opportunities.find((item) => item.id === parsed.data.id) : undefined;
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

export default router;