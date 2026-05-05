import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// =============================================================================
// Database seed script
// Run: npm run db:seed
// =============================================================================

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...\n");

  // --- Users ---
  const seedUsers = [
    {
      clerk_id: "seed_user_001",
      email: "admin@example.com",
      name: "Admin User",
    },
    {
      clerk_id: "seed_user_002",
      email: "test@example.com",
      name: "Test User",
    },
  ];

  for (const user of seedUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoNothing({ target: schema.users.email });
    console.log(`  ✓ User: ${user.email}`);
  }

  // Add more seed data for additional tables here:
  // --- Products ---
  // --- Orders ---
  // etc.

  console.log("\n✅ Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
