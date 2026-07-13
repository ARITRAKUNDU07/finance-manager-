import { PrismaClient } from "../prisma/generated/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
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
