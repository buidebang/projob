"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 font-sans antialiased">
      <div className="flex w-full max-w-[600px] flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-md">
        <h1 className="text-6xl font-black text-rose-500">500</h1>

        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100">
          Core Gateway Failure
        </h2>

        <p className="text-sm text-slate-400">
          A critical exception occurred in the processing orchestrator.
        </p>

        <Button
          variant="default"
          onClick={() => reset()}
          className="mt-4 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/10 transition-transform active:scale-95"
        >
          Re-initialize Node
        </Button>
      </div>
    </div>
  );
}
