"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function updateSystemConfig(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    const {
      tier_guest_profit_margin,
      tier_basic_profit_margin,
      tier_pro_profit_margin,
      tier_max_profit_margin,
      quota_cycle_type,
      soft_throttle_reduction_percent,
      pro_price,
      max_price,
      global_ai_generation_enabled,
      deep_search_enabled
    } = data;

    await prisma.systemConfig.upsert({
      where: { id: "CURRENT_GLOBAL_CONFIG" },
      update: {
        tier_guest_profit_margin,
        tier_basic_profit_margin,
        tier_pro_profit_margin,
        tier_max_profit_margin,
        quota_cycle_type,
        soft_throttle_reduction_percent,
        pro_price,
        max_price,
        global_ai_generation_enabled,
        deep_search_enabled
      },
      create: {
        id: "CURRENT_GLOBAL_CONFIG",
        tier_guest_profit_margin,
        tier_basic_profit_margin,
        tier_pro_profit_margin,
        tier_max_profit_margin,
        quota_cycle_type,
        soft_throttle_reduction_percent,
        pro_price,
        max_price,
        global_ai_generation_enabled,
        deep_search_enabled
      },
    });

    revalidateTag("system-config");

    return { success: true };
  } catch (error) {
    console.error("[updateSystemConfig error]", error);
    return { error: "Failed to update configuration." };
  }
}
