import knex, { Knex } from "knex";

/**
 * Singleton Knex instance.
 *
 * On Vercel serverless, each cold start gets its own instance.
 * We cache on `globalThis` during dev to survive HMR without
 * accumulating connection pools.
 */

const globalForKnex = globalThis as typeof globalThis & {
  __knex?: Knex;
};

function createKnex() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("[db] DATABASE_URL is not set — database will not be available");
  }

  return knex({
    client: "pg",
    connection: {
      connectionString: connectionString ?? "",
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      min: 0, // serverless: don't hold idle connections
      max: 5, // Neon/Supabase poolers handle the rest
      idleTimeoutMillis: 20_000,
      acquireTimeoutMillis: 10_000,
    },
  });
}

export const db = globalForKnex.__knex ?? createKnex();

if (process.env.NODE_ENV !== "production") {
  globalForKnex.__knex = db;
}
