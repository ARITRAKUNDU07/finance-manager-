"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function getCategories() {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null }, // presets
          ...(userId ? [{ userId }] : []), // user-specific
        ],
      },
      orderBy: { name: "asc" },
    });
    return categories;
  } catch (err) {
    console.error("Get categories error:", err);
    return [];
  }
}
