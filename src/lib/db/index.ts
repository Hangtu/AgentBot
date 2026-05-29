import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as relations from "./relations";
import * as schema from "./schema";

import { NeonHttpDatabase } from "drizzle-orm/neon-http";

// Use DATABASE_URL directly — serverEnv validation may be skipped in dev
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL environment variable is not defined. Database features are disabled.");
}

const combinedSchema = { ...schema, ...relations };

export const db = (databaseUrl
  ? drizzle(neon(databaseUrl), { schema: combinedSchema })
  : null) as unknown as NeonHttpDatabase<typeof combinedSchema>;

