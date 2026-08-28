import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";
import { fetchAllLiveOpportunities, EXPIRY_SWEEP_SQL } from "../lib/ingest-sources";

const router: IRouter = Router();

// POST /ingest/run — fetches all 5 live sources, upserts into Postgres,
// then sweeps expired non-demo rows (the 92-day rule). Protected by a
// shared secret since it writes to the DB and hits external APIs on
// every call — this is meant to be triggered by a cron/admin action,
// not exposed as a public endpoint.
router.post("/ingest/run", async (req, res) => {
  const providedSecret = req.header("x-ingest-secret");
  const expectedSecret = process.env.INGEST_SECRET;
  if (!expectedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const { rows, summary } = await fetchAllLiveOpportunities();

  if (rows.length > 0) {
    await db
      .insert(opportunitiesTable)
      .values(rows)
      .onConflictDoUpdate({
        target: opportunitiesTable.id,
        set: {
          title: sql`excluded.title`,
          organization: sql`excluded.organization`,
          description: sql`excluded.description`,
          category: sql`excluded.category`,
          tags: sql`excluded.tags`,
          eligibleCountries: sql`excluded.eligible_countries`,
          funding: sql`excluded.funding`,
          deadline: sql`excluded.deadline`,
          applicationUrl: sql`excluded.application_url`,
          status: sql`excluded.status`,
          verificationDate: sql`excluded.verification_date`,
          updatedAt: sql`now()`,
        },
      });
  }

  const sweepResult = await db.execute(sql.raw(EXPIRY_SWEEP_SQL));

  req.log.info({ summary, swept: sweepResult.rowCount ?? 0 }, "Ingest run completed");
  res.json({
    ok: true,
    fetched: summary,
    upserted: rows.length,
    expiredRemoved: sweepResult.rowCount ?? 0,
  });
});

export default router;
