import { PrismaClient } from "../prisma/generated/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import path from "path";

// Load environment variables manually to fix Next.js root folder misidentification
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

declare global {
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in process.env. Current directory:", process.cwd());
    throw new Error("DATABASE_URL is not set");
  }

  // Convert mysql:// protocol to mariadb:// for adapter compatibility
  const connectionString = databaseUrl.replace(/^mysql:\/\//, "mariadb://");
  
  const adapter = new PrismaMariaDb(connectionString);
  return new PrismaClient({ adapter });
};

export const prisma = globalThis.prisma || getPrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
