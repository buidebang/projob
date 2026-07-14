"use client";

import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import QuotaUpsellPortal from "@/components/modals/quota-upsell-portal";

export function UpgradeNudgeBadge() {
  const { data: session } = useSession();
  const [showPortal, setShowPortal] = useState(false);

  if (!session?.user || session.user.tier !== "FREE") {
    return null;
  }

  return (
    <>
      <div
        className="group fixed bottom-6 right-6 z-40 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onClick={() => setShowPortal(true)}
      >
        <div className="flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 backdrop-blur-sm">
          <Zap className="size-4 animate-pulse text-amber-300" />
          <span className="hidden sm:inline">Upgrade to Pro</span>
          <span className="sm:hidden">Pro</span>
        </div>
      </div>

      {showPortal && <QuotaUpsellPortal onClose={() => setShowPortal(false)} featureName="Advanced Intelligence Module" requiredTier="PRO" />}
    </>
  );
}
