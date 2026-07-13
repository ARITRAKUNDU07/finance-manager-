"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { accountSchema } from "@/lib/zod";
import { toMinorUnits } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createAccount(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please sign in." };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const balanceRaw = parseFloat(formData.get("startingBalance") as string || "0");

  const startingBalance = toMinorUnits(balanceRaw);

  const validated = accountSchema.safeParse({ name, type, startingBalance });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const account = await prisma.account.create({
      data: {
        userId: session.user.id,
        name: validated.data.name,
        type: validated.data.type,
        startingBalance: validated.data.startingBalance,
      },
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true, account };
  } catch (err: any) {
    console.error("Create account error:", err);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function getAccounts() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });
    return accounts;
  } catch (err) {
    console.error("Get accounts error:", err);
    return [];
  }
}

export async function getAccountsWithBalances() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      include: {
        transactions: true,
      },
    });

    const transfersIn = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "transfer",
        transferToAccountId: { not: null },
      },
    });

    return accounts.map((account) => {
      let balance = account.startingBalance;

      account.transactions.forEach((tx) => {
        if (tx.type === "income") {
          balance += tx.amountMinor;
        } else if (tx.type === "expense") {
          balance -= tx.amountMinor;
        } else if (tx.type === "transfer") {
          balance -= tx.amountMinor;
        }
      });

      transfersIn.forEach((tx) => {
        if (tx.transferToAccountId === account.id) {
          balance += tx.amountMinor;
        }
      });

      return {
        ...account,
        balance,
      };
    });
  } catch (err) {
    console.error("Get accounts with balances error:", err);
    return [];
  }
}
