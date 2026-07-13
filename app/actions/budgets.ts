"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { budgetSchema } from "@/lib/zod";
import { toMinorUnits } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createOrUpdateBudget(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in." };
  }

  const categoryId = formData.get("categoryId") as string;
  const monthYear = formData.get("monthYear") as string; // e.g. "2026-07"
  const limitRaw = parseFloat(formData.get("limit") as string || "0");

  const limit = limitRaw;

  const validated = budgetSchema.safeParse({ categoryId, monthYear, limit });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const limitMinor = toMinorUnits(validated.data.limit);

  try {
    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: validated.data.categoryId,
        monthYear: validated.data.monthYear,
      },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { limitMinor },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId: session.user.id,
          categoryId: validated.data.categoryId,
          monthYear: validated.data.monthYear,
          limitMinor,
        },
      });
    }

    revalidatePath("/budgets");
    revalidatePath("/");
    return { success: true, budget };
  } catch (err: any) {
    console.error("Create/update budget error:", err);
    return { error: "Failed to save budget. Please try again." };
  }
}

export async function getBudgetsWithSpending(monthYear: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    // Get all budgets for the month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        monthYear,
      },
      include: {
        category: true,
      },
    });

    // Get spending for each category in the given month
    const startOfMonth = new Date(`${monthYear}-01T00:00:00`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const spending = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: session.user.id,
        type: "expense",
        txnDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amountMinor: true,
      },
    });

    const spendingMap = new Map<string, number>();
    spending.forEach((s) => {
      if (s.categoryId) {
        spendingMap.set(s.categoryId, s._sum.amountMinor || 0);
      }
    });

    return budgets.map((budget) => {
      const spentMinor = spendingMap.get(budget.categoryId) || 0;
      const percentUsed = budget.limitMinor > 0 ? (spentMinor / budget.limitMinor) * 100 : 0;
      return {
        ...budget,
        spentMinor,
        percentUsed,
      };
    });
  } catch (err) {
    console.error("Get budgets with spending error:", err);
    return [];
  }
}
