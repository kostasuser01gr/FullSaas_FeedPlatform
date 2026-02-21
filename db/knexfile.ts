import type { Knex } from "knex";
import "dotenv/config";

const config: Knex.Config = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  pool: { min: 0, max: 5 },
  migrations: {
    directory: "./migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./seeds",
    extension: "ts",
  },
};

export default config;
