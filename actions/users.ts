"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { SubscriptionTier } from "@prisma/client";

export async function getUsers() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      tokens_consumed_this_cycle: true,
      is_throttled: true,
      current_cycle_start: true,
      credits: true,
      capacityMultiplier: true
    }
  });
  return { users };
}

export async function resetUserCycle(userId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        tokens_consumed_this_cycle: 0,
        is_throttled: false,
        current_cycle_start: new Date()
      },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function overrideUserTier(userId: string, tier: SubscriptionTier) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: { tier },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function triggerUserMultiplier(userId: string, multiplier: number) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.user.update({
      where: { id: userId },
      data: { capacityMultiplier: multiplier },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
