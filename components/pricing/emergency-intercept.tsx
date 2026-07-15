"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function EmergencyIntercept({ isEmergencyMode }: { isEmergencyMode: boolean }) {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isEmergencyMode && searchParams.get("success") === "true") {
      setShow(true);
    }
  }, [isEmergencyMode, searchParams]);

  if (!show) return null;

  return (
    <div className="pb-safe fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-w-lg flex-col items-center rounded-xl border bg-card p-8 text-center shadow-lg duration-300 animate-in fade-in zoom-in">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/10">
            <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="mb-4 text-2xl font-bold">Notice</h2>
        <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            System upgrade in progress. Full features will be restored within 48 hours. Your subscription billing is paused and will not be deducted. Enjoy the current AI as our compensation.
        </p>
        <button
            onClick={() => setShow(false)}
            className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
            Acknowledge
        </button>
      </div>
    </div>
  );
}
