import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;

export function getDb() {
  if (!instance) {
    if (!env.databaseUrl) {
      throw new Error("DATABASE_URL is not set — configure Supabase connection string in .env");
    }
    const client = postgres(env.databaseUrl, {
      // Supabase transaction pooler (port 6543) requires prepared statements off
      prepare: false,
      max: 10,
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
