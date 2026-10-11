"use client";

import { useState } from "react";
import QuotaUpsellPortal from "@/components/modals/quota-upsell-portal";

const TOOLS = [
  { id: "image", name: "AI Image Generator", description: "Generate high fidelity images instantly.", tier: "PRO" },
  { id: "chatpdf", name: "ChatPDF", description: "Talk to your PDF documents.", tier: "BASIC" },
  { id: "mindmap", name: "AI Mind Map Maker", description: "Visualize complex concepts.", tier: "ULTRA" },
  { id: "web", name: "Real-Time Web Access", description: "Search the web in real-time.", tier: "PRO" },
];

export default function AIToolGrid({ userTier = "FREE" }: { userTier?: string }) {
  const [showUpsell, setShowUpsell] = useState(false);
  const [activeFeature, setActiveFeature] = useState("");
  const [activeTier, setActiveTier] = useState("");

  const handleToolClick = (tool: any) => {
    // Simplified tier gating logic for demonstration
    const tierRanks: Record<string, number> = { "GUEST": 0, "FREE": 1, "BASIC": 2, "PRO": 3, "ULTRA": 4, "MAX": 5 };
    const userRank = tierRanks[userTier.toUpperCase()] || 1;
    const requiredRank = tierRanks[tool.tier] || 0;

    if (userRank < requiredRank) {
      setActiveFeature(tool.name);
      setActiveTier(tool.tier);
      setShowUpsell(true);
    } else {
      console.log("Routing to tool:", tool.name);
      // Actual routing logic would go here
    }
  };

  return (
    <div className="relative p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TOOLS.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className="cursor-pointer border border-slate-800 rounded-xl p-6 bg-slate-900/50 hover:bg-slate-800/50 transition flex flex-col gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-bold text-lg text-slate-200 z-10">{tool.name}</h3>
            <p className="text-sm text-slate-400 z-10">{tool.description}</p>
            <div className="mt-auto pt-4 z-10">
              <span className="text-xs font-mono bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                {tool.tier} TIER
              </span>
            </div>
          </div>
        ))}
      </div>

      {showUpsell && (
        <QuotaUpsellPortal
          setShowUpsellModal={setShowUpsell}
          onClose={() => setShowUpsell(false)}
          featureName={activeFeature}
          requiredTier={activeTier}
        />
      )}
    </div>
  );
}
