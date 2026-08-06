import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export function formatDate(date: Date | string, long?: boolean): string {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: long ? 'long' : '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: long ? 'long' : undefined
  })
}

export function formatDateNotTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(value)
}

export async function copyObjectPretty(data: Record<string, any>) {
  const text = Object.entries(data)
    .map(([key, value]) => `*${key}:* ${value}`)
    .join("\n")

  await navigator.clipboard.writeText(text)
}

export async function simpleCopyPretty(data: string) {
  await navigator.clipboard.writeText(data)
}