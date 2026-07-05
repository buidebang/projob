"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function getModels() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };
  const models = await prisma.aIModelRegistry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { models };
}

export async function createModel(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    const { provider, model_name, cost_per_million_input, cost_per_million_output, is_active, is_fallback_model } = data;

    if (is_fallback_model) {
       await prisma.aIModelRegistry.updateMany({
           where: { is_fallback_model: true },
           data: { is_fallback_model: false }
       });
    }

    if (is_active) {
       await prisma.aIModelRegistry.updateMany({
           where: { is_active: true },
           data: { is_active: false }
       });
    }

    await prisma.aIModelRegistry.create({
      data: {
        provider,
        model_name,
        cost_per_million_input: parseFloat(cost_per_million_input),
        cost_per_million_output: parseFloat(cost_per_million_output),
        is_active,
        is_fallback_model,
      },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error: any) {
    console.error("createModel Error:", error);
    return { error: error.message };
  }
}

export async function deleteModel(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    await prisma.aIModelRegistry.delete({
      where: { id },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
