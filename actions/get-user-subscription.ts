"use server";

import { getUserSubscriptionPlan } from "@/lib/subscription";
import { getCurrentUser } from "@/lib/session";

export async function getUserSubscriptionAction() {
  const user = await getCurrentUser();
  if (!user || !user.id) return null;
  const plan = await getUserSubscriptionPlan(user.id);
  return plan;
}
