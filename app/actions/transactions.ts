"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { transactionSchema } from "@/lib/zod";
import { toMinorUnits } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createTransaction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in." };
  }

  const type = formData.get("type") as string;
  const amountRaw = parseFloat(formData.get("amount") as string || "0");
  const accountId = formData.get("accountId") as string;
  const categoryId = formData.get("categoryId") as string || null;
  const transferToAccountId = formData.get("transferToAccountId") as string || null;
  const note = formData.get("note") as string || null;
  const paymentMethod = formData.get("paymentMethod") as string || null;
  const txnDate = formData.get("txnDate") as string;

  const amount = amountRaw;

  const validated = transactionSchema.safeParse({
    type,
    amount,
    accountId,
    categoryId,
    transferToAccountId,
    note,
    paymentMethod,
    txnDate,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const amountMinor = toMinorUnits(validated.data.amount);

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: validated.data.type,
        amountMinor,
        accountId: validated.data.accountId,
        categoryId: validated.data.categoryId,
        transferToAccountId: validated.data.transferToAccountId,
        note: validated.data.note,
        paymentMethod: validated.data.paymentMethod,
        txnDate: new Date(validated.data.txnDate),
      },
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    return { success: true, transaction };
  } catch (err: any) {
    console.error("Create transaction error:", err);
    return { error: "Failed to save transaction. Please try again." };
  }
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    await prisma.transaction.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/reports");
    return { success: true };
  } catch (err) {
    console.error("Delete transaction error:", err);
    return { error: "Failed to delete transaction." };
  }
}

export async function getTransactions(filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const whereClause: any = {
    userId: session.user.id,
  };

  if (filters) {
    if (filters.startDate || filters.endDate) {
      whereClause.txnDate = {};
      if (filters.startDate) {
        whereClause.txnDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        // Set end date to end of the day
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.txnDate.lte = end;
      }
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.accountId) {
      whereClause.accountId = filters.accountId;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      whereClause.amountMinor = {};
      if (filters.minAmount !== undefined) {
        whereClause.amountMinor.gte = toMinorUnits(filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        whereClause.amountMinor.lte = toMinorUnits(filters.maxAmount);
      }
    }

    if (filters.search) {
      whereClause.note = {
        contains: filters.search,
      };
    }
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        category: true,
      },
      orderBy: {
        txnDate: "desc",
      },
    });

    return transactions;
  } catch (err) {
    console.error("Get transactions error:", err);
    return [];
  }
}
