"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveKnowledge(values: { platform: string; rules_text: string }) {
  try {
    const existing = await prisma.knowledgeBase.findUnique({
      where: { platform: values.platform },
    });

    if (existing) {
      await prisma.knowledgeBase.update({
        where: { platform: values.platform },
        data: { rules_text: values.rules_text },
      });
    } else {
      await prisma.knowledgeBase.create({
        data: {
          platform: values.platform,
          rules_text: values.rules_text,
          embedding: [],
        },
      });
    }

    revalidatePath("/admin/knowledge");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save knowledge base", error);
    return { error: error.message || "Failed to save knowledge" };
  }
}
