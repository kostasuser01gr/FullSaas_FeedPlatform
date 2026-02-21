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
  return knex({
    client: "pg",
    connection: process.env.DATABASE_URL!,
    pool: {
      min: 0,          // serverless: don't hold idle connections
      max: 5,          // Neon/Supabase poolers handle the rest
      idleTimeoutMillis: 20_000,
    },
  });
}

export const db = globalForKnex.__knex ?? createKnex();

if (process.env.NODE_ENV !== "production") {
  globalForKnex.__knex = db;
}
