"use server";

import { prisma } from "@/lib/db";

export async function getActiveAuthProviders() {
  const config = await prisma.systemConfig.findUnique({
    where: { id: "CURRENT_GLOBAL_CONFIG" },
  });

  return config?.active_auth_providers || ["google"];
}
