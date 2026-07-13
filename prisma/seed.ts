import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

databaseUrl = databaseUrl.replace(/^['"]|['"]$/g, "");
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
    ? false
    : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const presetCategories = [
  { name: "Food", icon: "restaurant", isPreset: true },
  { name: "Rent", icon: "home", isPreset: true },
  { name: "Transport", icon: "directions_car", isPreset: true },
  { name: "Subscriptions", icon: "movie", isPreset: true },
  { name: "Shopping", icon: "shopping_bag", isPreset: true },
  { name: "Bills", icon: "payments", isPreset: true },
  { name: "Other", icon: "category", isPreset: true },
];

async function main() {
  console.log("Seeding preset categories...");
  for (const cat of presetCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, isPreset: true },
    });
    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
