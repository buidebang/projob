'use client';
import { Brain } from "lucide-react";

export function ExportBrainButton({ data }: { data: any }) {
  return (
    <button
      onClick={() => {
        const payload = JSON.stringify(data, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "ProJob-Global-Brain-Map.json";
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-500"
    >
      <Brain size={14} />
      Export Full Execution Map
    </button>
  );
}
