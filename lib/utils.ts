import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert float major currency (e.g. 124.50) to integer minor units (12450)
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

// Convert integer minor units (12450) to float major currency (124.50)
export function fromMinorUnits(amountMinor: number): number {
  return amountMinor / 100;
}

// Format integer minor units to currency string
export function formatCurrency(amountMinor: number, symbol: string = "₹"): string {
  const amount = fromMinorUnits(amountMinor);
  return `${symbol}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
