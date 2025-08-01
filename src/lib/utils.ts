import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un montant en devise
 */
export function formatCurrency(amount: number | string, currency: string = 'F'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0.00 ${currency}`;
  }
  
  return `${numAmount.toFixed(2)} ${currency}`;
}

/**
 * Formate un nombre avec des séparateurs de milliers
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  return numValue.toLocaleString('fr-FR');
}
