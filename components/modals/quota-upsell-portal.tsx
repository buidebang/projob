"use client";

import { motion } from "framer-motion";

export default function QuotaUpsellPortal({
  setShowUpsellModal,
  setDecayBypassed,
  setClickCount,
}: {
  setShowUpsellModal: (show: boolean) => void;
  setDecayBypassed: (bypassed: boolean) => void;
  setClickCount: (count: number) => void;
}) {
  return (
    <div className="pb-safe fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative my-auto w-full max-w-lg rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
      >
        <button
          onClick={() => setShowUpsellModal(false)}
          className="absolute right-4 top-4 font-mono text-sm text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
            Performance Cap Reached
          </span>
          <h3 className="text-xl font-black text-slate-100">
            Quota Exhaustion Detected
          </h3>
          <p className="text-left text-sm leading-relaxed text-slate-400">
            Your free-tier execution quota has hit the mathematical boundary.
            Upgrade to immediately unlock persistent high-fidelity AI models,
            deep searching, and unlimited context synthesis.
          </p>

          <div className="my-2 grid grid-cols-1 gap-3 text-left md:grid-cols-3">
            {/* Core Tiers */}
            <div className="relative flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              <span className="text-sm font-bold text-slate-200">Pro</span>
              <span className="text-xl font-black text-emerald-400">
                $5.00
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </span>
              <button
                onClick={() => (window.location.href = "/pricing")}
                className="mt-auto w-full rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
              >
                Upgrade to Pro
              </button>
            </div>

            <div className="relative flex flex-col gap-2 rounded-xl border-2 border-amber-500/60 bg-slate-800/80 p-3 shadow-lg shadow-amber-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-950">
                Most Popular
              </span>
              <span className="text-sm font-bold text-amber-100">Ultra</span>
              <span className="text-xl font-black text-amber-400">
                $20.00
                <span className="text-xs font-normal text-amber-500/60">
                  /mo
                </span>
              </span>
              <button
                onClick={() => (window.location.href = "/pricing")}
                className="mt-auto w-full rounded-lg bg-amber-500 p-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Upgrade to Ultra
              </button>
            </div>

            <div className="relative flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              <span className="text-sm font-bold text-slate-200">Max</span>
              <span className="text-xl font-black text-purple-400">
                $70.00
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </span>
              <button
                onClick={() => (window.location.href = "/pricing")}
                className="mt-auto w-full rounded-lg bg-slate-800 p-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
              >
                Upgrade to Max
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-slate-800 pt-2">
            <span className="text-xs font-bold text-slate-300">
              Need immediate capacity? Add a 30-day token multiplier:
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setDecayBypassed(true);
                  setShowUpsellModal(false);
                  setClickCount(0);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-3 text-xs font-black text-slate-100 shadow-xl shadow-blue-900/20 transition-transform active:scale-[0.99]"
              >
                ADD 2X TOKEN MULTIPLIER ($5.00)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDecayBypassed(true);
                    setShowUpsellModal(false);
                    setClickCount(0);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2 text-xs font-bold text-slate-300 transition-transform hover:bg-slate-700 active:scale-[0.99]"
                >
                  ADD 3X TOKENS ($10.00)
                </button>
                <button
                  onClick={() => {
                    setDecayBypassed(true);
                    setShowUpsellModal(false);
                    setClickCount(0);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2 text-xs font-bold text-slate-300 transition-transform hover:bg-slate-700 active:scale-[0.99]"
                >
                  ADD 4X TOKENS ($15.00)
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
