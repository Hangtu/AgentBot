import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as relations from "./relations";
import * as schema from "./schema";

// Use DATABASE_URL directly — serverEnv validation may be skipped in dev
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema: { ...schema, ...relations } });
