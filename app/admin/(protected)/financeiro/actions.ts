"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseDateOrNull } from "@/lib/serialize";
import { accountSchema, expenseSchema, type AccountValues, type ExpenseValues } from "@/lib/validations/finance";
import type { ExpenseCategory } from "@prisma/client";

const clean = (value?: string) => (value && value.trim().length > 0 ? value.trim() : null);

function refresh() {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/financeiro/despesas");
  revalidatePath("/admin/financeiro/contas");
  revalidatePath("/admin/faturas");
  revalidatePath("/admin");
}

/* ------------------------------ Contas ------------------------------ */

function accountData(parsed: AccountValues) {
  return {
    name: parsed.name,
    bankName: clean(parsed.bankName),
    accountNumber: clean(parsed.accountNumber),
    openingBalance: parsed.openingBalance,
    notes: clean(parsed.notes),
    active: parsed.active,
  };
}

/** Devolve a conta criada (com saldo = saldo inicial) para ser seleccionada logo. */
export async function createAccount(values: AccountValues) {
  await requireAdmin();
  const parsed = accountSchema.parse(values);
  const account = await prisma.account.create({ data: accountData(parsed) });
  refresh();

  return {
    id: account.id,
    name: account.name,
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    balance: Number(account.openingBalance),
  };
}

export async function updateAccount(id: string, values: AccountValues) {
  await requireAdmin();
  const parsed = accountSchema.parse(values);
  await prisma.account.update({ where: { id }, data: accountData(parsed) });
  refresh();
}

export async function deleteAccount(id: string) {
  await requireAdmin();

  const [invoices, expenses] = await Promise.all([
    prisma.invoice.count({ where: { accountId: id } }),
    prisma.expense.count({ where: { accountId: id } }),
  ]);
  if (invoices + expenses > 0) {
    throw new Error("Esta conta já tem movimentos. Em vez de a eliminar, desactive-a.");
  }

  await prisma.account.delete({ where: { id } });
  refresh();
}

/* ----------------------------- Despesas ----------------------------- */

async function expenseData(parsed: ExpenseValues) {
  if (parsed.accountId) {
    const exists = await prisma.account.findUnique({ where: { id: parsed.accountId }, select: { id: true } });
    if (!exists) throw new Error("Conta inválida.");
  }

  return {
    description: parsed.description,
    amount: parsed.amount,
    date: parseDateOrNull(parsed.date) ?? new Date(),
    category: parsed.category as ExpenseCategory,
    supplier: clean(parsed.supplier),
    notes: clean(parsed.notes),
    accountId: clean(parsed.accountId),
    projectId: clean(parsed.projectId),
  };
}

export async function createExpense(values: ExpenseValues) {
  await requireAdmin();
  const parsed = expenseSchema.parse(values);
  await prisma.expense.create({ data: await expenseData(parsed) });
  refresh();
}

export async function updateExpense(id: string, values: ExpenseValues) {
  await requireAdmin();
  const parsed = expenseSchema.parse(values);
  await prisma.expense.update({ where: { id }, data: await expenseData(parsed) });
  refresh();
}

export async function deleteExpense(id: string) {
  await requireAdmin();
  await prisma.expense.delete({ where: { id } });
  refresh();
}
