import {
  pgTable,
  text,
  smallint,
  integer,
  boolean,
  date,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const opportunitiesTable = pgTable("opportunities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  eligibleCountries: text("eligible_countries").array().notNull().default([]),
  minAge: smallint("min_age").notNull(),
  maxAge: smallint("max_age").notNull(),
  educationRequirements: text("education_requirements").array().notNull().default([]),
  studentRequirement: text("student_requirement").notNull(),
  skills: text("skills").array().notNull().default([]),
  travelRequirement: text("travel_requirement", {
    enum: ["none", "local", "international"],
  }).notNull(),
  onlineAvailability: boolean("online_availability").notNull().default(true),
  funding: text("funding").notNull(),
  applicationCost: integer("application_cost").notNull().default(0),
  deadline: date("deadline").notNull(),
  requiredDocuments: text("required_documents").array().notNull().default([]),
  applicationUrl: text("application_url").notNull(),
  status: text("status", { enum: ["open", "closing-soon"] }).notNull(),
  source: text("source").notNull(),
  verificationDate: date("verification_date").notNull(),
  demoData: boolean("demo_data").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const savedOpportunitiesTable = pgTable(
  "saved_opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deviceId: uuid("device_id").notNull(),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.deviceId, table.opportunityId)],
);

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable);
export const selectOpportunitySchema = createSelectSchema(opportunitiesTable);
export type InsertOpportunity = typeof opportunitiesTable.$inferInsert;
export type SelectOpportunity = typeof opportunitiesTable.$inferSelect;

export const insertSavedOpportunitySchema = createInsertSchema(savedOpportunitiesTable);
export const selectSavedOpportunitySchema = createSelectSchema(savedOpportunitiesTable);
export type InsertSavedOpportunity = typeof savedOpportunitiesTable.$inferInsert;
export type SelectSavedOpportunity = typeof savedOpportunitiesTable.$inferSelect;
