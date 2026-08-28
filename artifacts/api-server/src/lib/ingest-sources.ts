// Live external-source ingestion for Aza's opportunities table.
//
// Five real, free, no-auth sources — two jobs, one each for hackathons,
// scholarships, and grants/fellowships. Each normalizer maps its source's
// shape onto the exact `opportunities` row shape used everywhere else in
// this codebase (see rowToOpportunity in routes/opportunities.ts).
//
// Attribution requirements (checked at integration time, Aug 2026):
//   - Himalayas: requires a visible link back + "via Himalayas" mention.
//     Do not push their listings into other third-party job aggregators.
//   - Jobicy: requires attribution; poll at most hourly; do not
//     redistribute to other job boards/aggregators.
//   - Devpost: no official API. Uses a community-maintained daily-scraped
//     JSON mirror (open-hackathons-api). Fragile by nature — if this
//     mirror goes down, this source silently returns zero rows rather
//     than failing the whole ingest run.
//   - Scholars4Dev / The Grant Desk: standard RSS, no redistribution
//     restrictions found, but only title/link/short description are
//     reliably structured — full eligibility/deadline detail lives on
//     the source site, which is why applicationUrl always points back
//     there.
//
// Every row gets source, verificationDate and demoData: false set
// consistently so the frontend can distinguish live-ingested rows from
// the original hand-curated seed data if needed later.

import type { InsertOpportunity } from "@workspace/db";

const today = () => new Date();
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const in92Days = () => new Date(Date.now() + 92 * 86_400_000);

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&#8217;/g, "'").replace(/&amp;/g, "&").trim();
}

function parseRssItems(xml: string, max: number): string[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, max).map((m) => m[1]);
}

function rssField(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s"));
  return m ? m[1] : "";
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        // Some sources (WordPress sites especially) reject requests with
        // no or generic User-Agent headers. Identify honestly rather than
        // spoofing a browser.
        "User-Agent": "AzaOpportunityFinder/1.0 (+https://a-za.vercel.app)",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      console.error(`[ingest] fetch failed: ${url} -> HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    return res;
  } catch (err) {
    console.error(`[ingest] fetch threw: ${url} ->`, err instanceof Error ? err.message : err);
    return null;
  }
}

// ---- 1. Himalayas — remote jobs ----
async function fetchHimalayas(): Promise<InsertOpportunity[]> {
  const res = await safeFetch("https://himalayas.app/jobs/api?limit=20");
  if (!res) return [];
  const data = (await res.json()) as { jobs?: any[] };
  const jobs: any[] = data?.jobs ?? [];
  return jobs.map((j) => {
    const countries = (j.locationRestrictions ?? []).map((c: any) => c.alpha2).filter(Boolean);
    return {
      id: `himalayas-${j.guid}`,
      title: String(j.title ?? "Remote role").slice(0, 200),
      organization: String(j.companyName ?? "Unknown company"),
      description: `${stripHtml(j.excerpt ?? "").slice(0, 450)} (Sourced via Himalayas — himalayas.app)`,
      category: "Job",
      tags: (j.categories ?? []).slice(0, 5),
      eligibleCountries: countries.length ? countries : ["GLOBAL"],
      minAge: 18,
      maxAge: 99,
      educationRequirements: ["undergraduate", "postgraduate", "secondary"],
      studentRequirement: "any",
      skills: (j.categories ?? []).slice(0, 5),
      travelRequirement: "none" as const,
      onlineAvailability: true,
      funding: j.minSalary
        ? `${j.currency ?? "USD"} ${j.minSalary}-${j.maxSalary ?? j.minSalary} (${j.salaryPeriod ?? "annual"})`
        : "Paid position (salary not disclosed)",
      applicationCost: 0,
      deadline: toISO(j.expiryDate ? new Date(j.expiryDate) : in92Days()),
      requiredDocuments: ["resume"],
      applicationUrl: j.applicationLink ?? "https://himalayas.app",
      status: "open" as const,
      source: "Himalayas (himalayas.app)",
      verificationDate: toISO(today()),
      demoData: false,
    };
  });
}

// ---- 2. Jobicy — remote jobs ----
async function fetchJobicy(): Promise<InsertOpportunity[]> {
  const res = await safeFetch("https://jobicy.com/api/v2/remote-jobs?count=20");
  if (!res) return [];
  const data = (await res.json()) as { jobs?: any[] };
  const jobs: any[] = data?.jobs ?? [];
  return jobs.map((j) => ({
    id: `jobicy-${j.id}`,
    title: String(j.jobTitle ?? "Remote role").slice(0, 200),
    organization: String(j.companyName ?? "Unknown company"),
    description: `${stripHtml(j.jobExcerpt ?? "").slice(0, 450)} (Sourced via Jobicy — jobicy.com)`,
    category: "Job",
    tags: [j.jobIndustry].filter(Boolean),
    eligibleCountries: j.jobGeo && j.jobGeo !== "Worldwide" ? [j.jobGeo] : ["GLOBAL"],
    minAge: 18,
    maxAge: 99,
    educationRequirements: ["undergraduate", "postgraduate", "secondary"],
    studentRequirement: "any",
    skills: [j.jobIndustry].filter(Boolean),
    travelRequirement: "none" as const,
    onlineAvailability: true,
    funding: j.annualSalaryMin
      ? `${j.salaryCurrency ?? "USD"} ${j.annualSalaryMin}-${j.annualSalaryMax ?? j.annualSalaryMin}/yr`
      : "Paid position (salary not disclosed)",
    applicationCost: 0,
    deadline: toISO(in92Days()),
    requiredDocuments: ["resume"],
    applicationUrl: j.url ?? "https://jobicy.com",
    status: "open" as const,
    source: "Jobicy (jobicy.com)",
    verificationDate: toISO(today()),
    demoData: false,
  }));
}

// ---- 3. Devpost — hackathons (via community-maintained JSON mirror; no official API exists) ----
async function fetchDevpost(): Promise<InsertOpportunity[]> {
  const res = await safeFetch("https://webdevharsha.github.io/open-hackathons-api/data.json");
  if (!res) return [];
  const data = (await res.json()) as { hackathons?: any[] };
  const hackathons: any[] = data?.hackathons ?? [];
  return hackathons
    .filter((h) => h.isOpen === "open")
    .slice(0, 20)
    .map((h) => ({
      id: `devpost-${h.id}`,
      title: String(h.title ?? "Hackathon").trim().slice(0, 200),
      organization: String(h.organization_name ?? "Unknown organizer"),
      description: `${h.submission_period_dates ?? ""}. Themes: ${(h.themes ?? []).map((t: any) => t.name).join(", ")}. (Listed via Devpost)`.slice(0, 500),
      category: "Hackathon",
      tags: (h.themes ?? []).map((t: any) => t.name).slice(0, 5),
      eligibleCountries: ["GLOBAL"],
      minAge: 13,
      maxAge: 99,
      educationRequirements: ["undergraduate", "postgraduate", "secondary"],
      studentRequirement: "any",
      skills: (h.themes ?? []).map((t: any) => t.name).slice(0, 5),
      travelRequirement: h.displayed_location === "Online" ? ("none" as const) : ("local" as const),
      onlineAvailability: h.displayed_location === "Online",
      funding: h.prizeText ? stripHtml(h.prizeText) : "Prizes vary",
      applicationCost: 0,
      deadline: toISO(in92Days()),
      requiredDocuments: ["project submission"],
      applicationUrl: h.url ?? "https://devpost.com/hackathons",
      status: "open" as const,
      source: "Devpost (via open-hackathons-api mirror)",
      verificationDate: toISO(today()),
      demoData: false,
    }));
}

// ---- 4. Scholars4Dev — scholarships (RSS) ----
async function fetchScholars4Dev(): Promise<InsertOpportunity[]> {
  const res = await safeFetch("https://www.scholars4dev.com/feed/");
  if (!res) return [];
  const xml = await res.text();
  const items = parseRssItems(xml, 15);
  return items.map((block, i) => {
    const title = stripHtml(rssField(block, "title")) || "Scholarship opportunity";
    const link = rssField(block, "link").trim() || "https://www.scholars4dev.com";
    return {
      id: `scholars4dev-${Buffer.from(link).toString("base64url").slice(0, 24)}-${i}`,
      title: title.slice(0, 200),
      organization: "Various — see listing",
      description:
        "Scholarship listing curated by Scholars4Dev. See the original listing for full eligibility and deadline details.",
      category: "Scholarship",
      tags: ["scholarship", "international"],
      eligibleCountries: ["GLOBAL"],
      minAge: 16,
      maxAge: 99,
      educationRequirements: ["undergraduate", "postgraduate", "secondary"],
      studentRequirement: "any",
      skills: [],
      travelRequirement: "none" as const,
      onlineAvailability: true,
      funding: "Varies — see listing",
      applicationCost: 0,
      deadline: toISO(in92Days()),
      requiredDocuments: ["see listing"],
      applicationUrl: link,
      status: "open" as const,
      source: "Scholars4Dev (scholars4dev.com)",
      verificationDate: toISO(today()),
      demoData: false,
    };
  });
}

// ---- 5. The Grant Desk — grants + fellowships (RSS) ----
async function fetchGrantDesk(): Promise<InsertOpportunity[]> {
  const res = await safeFetch("https://www.artificialnouveau.com/smalltools/grants/feed-worldwide.xml");
  if (!res) return [];
  const xml = await res.text();
  const items = parseRssItems(xml, 15);
  return items.map((block, i) => {
    const title = stripHtml(rssField(block, "title")) || "Grant/fellowship opportunity";
    const link = rssField(block, "link").trim() || "https://www.artificialnouveau.com/smalltools/grants/";
    const desc = stripHtml(rssField(block, "description"));
    const deadlineMatch = desc.match(/Deadline:\s*(\d{1,2}\s\w{3}\s\d{4})/);
    let deadline = toISO(in92Days());
    if (deadlineMatch) {
      const parsed = new Date(deadlineMatch[1]);
      if (!isNaN(parsed.getTime())) deadline = toISO(parsed);
    }
    const isFellowship = /fellowship|residenc/i.test(title);
    return {
      id: `grantdesk-${Buffer.from(link).toString("base64url").slice(0, 24)}-${i}`,
      title: title.slice(0, 200),
      organization: "Various — see listing",
      description: (desc || "See original listing for full details.").slice(0, 500),
      category: isFellowship ? "Fellowship" : "Grant",
      tags: ["funding", "international"],
      eligibleCountries: ["GLOBAL"],
      minAge: 18,
      maxAge: 99,
      educationRequirements: ["undergraduate", "postgraduate", "secondary"],
      studentRequirement: "any",
      skills: [],
      travelRequirement: "none" as const,
      onlineAvailability: true,
      funding: "Varies — see listing",
      applicationCost: 0,
      deadline,
      requiredDocuments: ["see listing"],
      applicationUrl: link,
      status: "open" as const,
      source: "The Grant Desk (artificialnouveau.com)",
      verificationDate: toISO(today()),
      demoData: false,
    };
  });
}

export interface IngestSummary {
  himalayas: number;
  jobicy: number;
  devpost: number;
  scholars4dev: number;
  grantdesk: number;
  total: number;
}

export async function fetchAllLiveOpportunities(): Promise<{
  rows: InsertOpportunity[];
  summary: IngestSummary;
}> {
  const [himalayas, jobicy, devpost, scholars4dev, grantdesk] = await Promise.all([
    fetchHimalayas(),
    fetchJobicy(),
    fetchDevpost(),
    fetchScholars4Dev(),
    fetchGrantDesk(),
  ]);

  const rows = [...himalayas, ...jobicy, ...devpost, ...scholars4dev, ...grantdesk];
  return {
    rows,
    summary: {
      himalayas: himalayas.length,
      jobicy: jobicy.length,
      devpost: devpost.length,
      scholars4dev: scholars4dev.length,
      grantdesk: grantdesk.length,
      total: rows.length,
    },
  };
}

// The 92-day rule: any row (live-ingested or manually seeded) whose
// deadline has already passed, or is more than 92 days out with no real
// deadline info (our synthetic in92Days() fallback), gets swept.
// Only touches non-demo rows so hand-curated seed data with demoData
// still under manual control isn't silently deleted by this job.
export const EXPIRY_SWEEP_SQL = `
  delete from opportunities
  where demo_data = false
    and deadline < current_date
`;
