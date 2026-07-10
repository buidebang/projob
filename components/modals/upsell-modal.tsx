"use client";

import { motion } from "framer-motion";

export default function UpsellModal({
  setShowUpsellModal,
  setDecayBypassed,
  setClickCount,
}: {
  setShowUpsellModal: (show: boolean) => void;
  setDecayBypassed: (bypassed: boolean) => void;
  setClickCount: (count: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative w-full max-w-sm rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
      >
        <button
          onClick={() => setShowUpsellModal(false)}
          className="absolute right-4 top-4 font-mono text-sm text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
        <div className="flex flex-col gap-3 text-center">
          <span className="mx-auto w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            Performance Cap Reached
          </span>
          <h3 className="text-lg font-black text-slate-100">
            Bypass Local Performance Decay
          </h3>
          <p
            className="text-left text-xs leading-relaxed text-slate-400"
            style={{ direction: "ltr" }}
          >
            Your workspace query context threshold has triggered active
            budget mitigation loops. Unlock deep semantic live web
            research nodes and continuous highest-fidelity model
            allocations immediately.
          </p>
          <div className="my-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left font-mono text-[10px]">
            <div className="flex justify-between text-slate-500">
              <span>Deep Search Horizons:</span>
              <span className="font-bold text-rose-400">
                Throttled (Base)
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Synthesis Resolution:</span>
              <span className="font-bold text-rose-400">
                Decay Active
              </span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 text-slate-100">
              <span>Unlocked Node Infrastructure:</span>
              <span className="font-bold text-emerald-400">
                Google Gemini Pro Core
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setDecayBypassed(true);
              setShowUpsellModal(false);
              setClickCount(0);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-3 text-xs font-black text-slate-950 shadow-xl shadow-orange-500/10 transition-transform active:scale-[0.99]"
          >
            UNLEASH HYPER-ENGINE ($5.00) ⚡
          </button>
          <span className="block text-[9px] leading-normal text-slate-600">
            One-click transactional allocation routed via Stripe. Removes
            local bandwidth execution caps instantly for 30 days.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
