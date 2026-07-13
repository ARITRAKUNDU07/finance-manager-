import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables manually to fix Next.js root folder misidentification
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

declare global {
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  let databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in process.env. Current directory:", process.cwd());
    throw new Error("DATABASE_URL is not set");
  }

  // Strip any leading/trailing quotes from environment variable
  databaseUrl = databaseUrl.replace(/^['"]|['"]$/g, "");

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

export const prisma = globalThis.prisma || getPrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
