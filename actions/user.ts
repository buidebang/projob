"use server";

import { evaluateUsageAndGetModel } from "@/lib/rate-limiter";
import { getCurrentUser } from "@/lib/session";

export async function checkUsageStatus() {
  const user = await getCurrentUser();
  if (!user || !user.id) return { isThrottled: true };
  const status = await evaluateUsageAndGetModel(user.id);
  return { isThrottled: status.isThrottled };
}
