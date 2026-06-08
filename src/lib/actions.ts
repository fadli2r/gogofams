"use server";

import { db } from "./db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createMasterAccount(formData: {
  accountName: string;
  categoryId?: string;
  registeredDate: string;
  expiredDate: string;
  lastPassword: string;
}) {
  try {
    await db.masterAccount.create({
      data: {
        accountName: formData.accountName,
        categoryId: formData.categoryId || null,
        registeredDate: new Date(formData.registeredDate),
        expiredDate: new Date(formData.expiredDate),
        lastPassword: formData.lastPassword,
      },
    });
    revalidatePath("/");
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating master account:", error);
    return { success: false, error: error.message || "Failed to create master account" };
  }
}

export async function updateMasterAccountPassword(id: string, lastPassword: string) {
  try {
    await db.masterAccount.update({
      where: { id },
      data: { lastPassword },
    });
    revalidatePath("/");
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message || "Failed to update password" };
  }
}

export async function getMasterAccounts() {
  try {
    const accounts = await db.masterAccount.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: accounts.map(a => ({
        id: a.id,
        accountName: a.accountName,
        categoryId: a.categoryId,
        categoryName: a.category?.name || null,
        registeredDate: a.registeredDate.toISOString(),
        expiredDate: a.expiredDate.toISOString(),
        lastPassword: a.lastPassword,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("Error fetching master accounts:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function createTransaction(formData: {
  accountId: string;
  customerName: string;
  customerEmail?: string;
  orderNumber: string;
  startDate: string;
  duration: number; // 7, 14, 30
}) {
  try {
    const start = new Date(formData.startDate);
    const expired = new Date(start.getTime() + formData.duration * 24 * 60 * 60 * 1000);

    await db.transaction.create({
      data: {
        accountId: formData.accountId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || null,
        orderNumber: formData.orderNumber,
        startDate: start,
        duration: formData.duration,
        expiredDate: expired,
      },
    });
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message || "Failed to create transaction" };
  }
}

export async function getTransactions() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        masterAccount: {
          select: {
            accountName: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: transactions.map(t => ({
        id: t.id,
        accountId: t.accountId,
        accountName: t.masterAccount.accountName,
        categoryName: t.masterAccount.category?.name || null,
        customerName: t.customerName,
        customerEmail: t.customerEmail || null,
        orderNumber: t.orderNumber,
        startDate: t.startDate.toISOString(),
        duration: t.duration,
        expiredDate: t.expiredDate.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function getDashboardData() {
  try {
    const now = new Date();
    
    // 1. Expired/expiring transactions (expiredDate is today or in the past)
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const expiredTransactions = await db.transaction.findMany({
      where: {
        expiredDate: {
          lte: endOfToday,
        },
      },
      include: {
        masterAccount: {
          select: {
            accountName: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { expiredDate: "asc" },
    });

    // 2. Expired/expiring master accounts (expiredDate is within the next 2 days or has passed)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999);

    const expiringMasterAccounts = await db.masterAccount.findMany({
      where: {
        expiredDate: {
          lte: twoDaysFromNow,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { expiredDate: "asc" },
    });

    return {
      success: true,
      transactions: expiredTransactions.map(t => ({
        id: t.id,
        accountId: t.accountId,
        accountName: t.masterAccount.accountName,
        categoryName: t.masterAccount.category?.name || null,
        customerName: t.customerName,
        customerEmail: t.customerEmail || null,
        orderNumber: t.orderNumber,
        startDate: t.startDate.toISOString(),
        duration: t.duration,
        expiredDate: t.expiredDate.toISOString(),
      })),
      accounts: expiringMasterAccounts.map(a => ({
        id: a.id,
        accountName: a.accountName,
        categoryName: a.category?.name || null,
        registeredDate: a.registeredDate.toISOString(),
        expiredDate: a.expiredDate.toISOString(),
        lastPassword: a.lastPassword,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, transactions: [], accounts: [], error: error.message };
  }
}

export async function deleteMasterAccount(id: string) {
  try {
    await db.masterAccount.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting master account:", error);
    return { success: false, error: error.message || "Failed to delete master account" };
  }
}

export async function deleteTransaction(id: string) {
  try {
    await db.transaction.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/accounts");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message || "Failed to delete transaction" };
  }
}

export async function createCategory(name: string) {
  try {
    await db.category.create({
      data: { name },
    });
    revalidatePath("/categories");
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { masterAccounts: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return {
      success: true,
      data: categories.map(c => ({
        id: c.id,
        name: c.name,
        accountsCount: c._count.masterAccounts,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id },
    });
    revalidatePath("/categories");
    revalidatePath("/accounts");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

export async function loginUser(formData: any) {
  const { username, password } = formData;
  if (username === "gogomi" && password === "@Saya4862") {
    const cookieStore = await cookies();
    cookieStore.set("gogomi_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Username atau password salah!" };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("gogomi_session");
  return { success: true };
}
