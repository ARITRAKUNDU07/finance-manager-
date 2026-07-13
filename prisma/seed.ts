import { PrismaClient } from "./generated/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = databaseUrl.replace(/^mysql:\/\//, "mariadb://");
const adapter = new PrismaMariaDb(connectionString);
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
