"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateSystemConfig(data: {
  isEmergencyMode: boolean;
  fallbackModelName: string;
  fallbackApiKeys: string[];
  models?: any[];
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.systemConfig.update({
    where: { id: "CURRENT_GLOBAL_CONFIG" },
    data: {
      isEmergencyMode: data.isEmergencyMode,
      fallbackModelName: data.fallbackModelName,
      fallbackApiKeys: data.fallbackApiKeys,
    },
  });

  if (data.models && data.models.length > 0) {
      for (const model of data.models) {
          await prisma.aIModelRegistry.update({
              where: { id: model.id },
              data: {
                  api_key: model.api_key,
                  base_url: model.base_url,
                  constraints: model.constraints
              }
          });
      }
  }

  revalidatePath("/admin");
}
