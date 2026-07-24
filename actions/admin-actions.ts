"use server";

import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto";

export async function updateApiConfig(data: any) {
    // Encrypt the keys if they exist
    const updateData: any = {
        api_routing_mode: data.api_routing_mode
    };
    if (data.provider_google_key) updateData.provider_google_key = encrypt(data.provider_google_key);
    if (data.provider_anthropic_key) updateData.provider_anthropic_key = encrypt(data.provider_anthropic_key);
    if (data.provider_openai_key) updateData.provider_openai_key = encrypt(data.provider_openai_key);
    if (data.provider_deepseek_key) updateData.provider_deepseek_key = encrypt(data.provider_deepseek_key);

    await prisma.systemConfig.update({
        where: { id: "CURRENT_GLOBAL_CONFIG" },
        data: updateData
    });
    return { success: true };
}
