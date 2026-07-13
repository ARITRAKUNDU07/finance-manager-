import { z } from "zod";

// Auth Validation
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Account Validation
export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["cash", "bank", "card"], {
    message: "Type must be cash, bank, or card",
  }),
  startingBalance: z.number().int("Balance must be an integer (minor units)"),
});

// Category Validation
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  icon: z.string().optional().nullable(),
});

// Transaction Validation
export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Amount must be positive"),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().optional().nullable(),
  transferToAccountId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  txnDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date string",
  }),
}).refine((data) => {
  if (data.type === "transfer" && !data.transferToAccountId) {
    return false;
  }
  return true;
}, {
  message: "Transfer destination account is required",
  path: ["transferToAccountId"],
});

// Budget Validation
export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
  limit: z.number().positive("Limit must be positive"),
});
