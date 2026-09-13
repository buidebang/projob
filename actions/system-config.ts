"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { encrypt } from "@/lib/crypto";

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
        deep_search_enabled,
        ai_base_url: data.ai_base_url,
        ai_auth_header_type: data.ai_auth_header_type,
        ai_target_model_id: data.ai_target_model_id,
        api_routing_mode: data.api_routing_mode,
        global_aggregator_key: data.global_aggregator_key ? encrypt(data.global_aggregator_key) : undefined,
        provider_google_key: data.provider_google_key ? encrypt(data.provider_google_key) : undefined,
        provider_anthropic_key: data.provider_anthropic_key ? encrypt(data.provider_anthropic_key) : undefined,
        provider_openai_key: data.provider_openai_key ? encrypt(data.provider_openai_key) : undefined,
        commercial_tier_matrix: data.commercial_tier_matrix,
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
        deep_search_enabled,
        ai_base_url: data.ai_base_url,
        ai_auth_header_type: data.ai_auth_header_type,
        ai_target_model_id: data.ai_target_model_id,
        api_routing_mode: data.api_routing_mode,
        global_aggregator_key: data.global_aggregator_key ? encrypt(data.global_aggregator_key) : undefined,
        provider_google_key: data.provider_google_key ? encrypt(data.provider_google_key) : undefined,
        provider_anthropic_key: data.provider_anthropic_key ? encrypt(data.provider_anthropic_key) : undefined,
        provider_openai_key: data.provider_openai_key ? encrypt(data.provider_openai_key) : undefined,
        commercial_tier_matrix: data.commercial_tier_matrix,
      },
    });

    revalidateTag("system-config");

    return { success: true };
  } catch (error) {
    console.error("[updateSystemConfig error]", error);
    return { error: "Failed to update configuration." };
  }
}
