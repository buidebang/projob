**ARCHITECTURAL PROPOSAL: REAL-TIME NEURAL DESYNC & STATE ORCHESTRATION**

### Part 1: The Client Telemetry UI (Server-Sent Events / Polling Hybrid)

To solve the "Silent Truncation", "Audit Loop Blackhole", and "Jitter Queue Race Condition", we cannot rely on a single HTTP Request/Response cycle. Because Next.js Serverless functions time out after 10-60s, the backend must return a 202 Accepted with a `jobId`, and the UI must stream the execution state.

**The `useNeuralStream` Hook Logic:**

```typescript
import { useState, useEffect } from 'react';

export function useNeuralStream(jobId: string | null) {
  const [telemetry, setTelemetry] = useState({ status: 'IDLE', logs: [], progress: 0 });

  useEffect(() => {
    if (!jobId) return;

    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/jobs/status?id=${jobId}`);
        const data = await res.json();

        // Data format expects intermediate logs array from the backend
        // e.g., ["Rowboat: Building Vector Graph...", "TryAI: Output rejected (Attempt 2)"]
        setTelemetry({
          status: data.status,
          logs: data.telemetryLogs || [],
          progress: data.progress || 0
        });

        if (data.status === "COMPLETED" || data.status === "FAILED" || data.status === "ABORTED") {
          clearInterval(intervalId);
        }
      } catch (err) {
        setTelemetry(prev => ({ ...prev, status: 'ERROR', logs: [...prev.logs, "Connection lost."] }));
      }
    };

    intervalId = setInterval(pollStatus, 1500); // 1.5s Jitter Queue Polling
    pollStatus();

    return () => clearInterval(intervalId);
  }, [jobId]);

  return telemetry;
}
```

*Backend Implication:* The `AgentJob` Prisma model must be updated to include a `JSON` field called `telemetryLogs` where the `ProcessingOrchestrator` pushes state arrays asynchronously.

---

### Part 2: The TRUE Admin Kill Switch (AbortController integration)

To solve the "Vercel Serverless Timeout" and the "Fake Kill Switch", the backend orchestrator must utilize a static global `Map` of `AbortController` instances tied to active Job IDs.

**The Architecture:**

```typescript
// lib/ai/orchestrator.ts

// Global registry in memory (Requires a persistent Node server or Redis for Edge)
export const ActiveJobRegistry = new Map<string, AbortController>();

export class ProcessingOrchestrator {
  public async executeComplexRequest(prompt: string, jobId: string) {
    const controller = new AbortController();
    ActiveJobRegistry.set(jobId, controller);

    try {
      // Pass signal to fetch calls in AIGateway
      const plan = await this.gateway.pingMaster(prompt, controller.signal);

      // Simulate checking abort signal between steps
      if (controller.signal.aborted) throw new Error("ABORT_SIGNAL");

      const workerPromises = plan.tasks.map(task =>
        this.gateway.pingWorker(task, controller.signal)
      );

      return await Promise.all(workerPromises);
    } finally {
      ActiveJobRegistry.delete(jobId);
    }
  }

  public static killJob(jobId: string) {
    if (ActiveJobRegistry.has(jobId)) {
      ActiveJobRegistry.get(jobId)?.abort();
      ActiveJobRegistry.delete(jobId);
    }
  }
}
```

*Admin Action:* The UI "Halt Agents" button hits a `/api/admin/kill-switch` endpoint, which invokes `ProcessingOrchestrator.killJob(jobId)`.

---

### Part 3: The Updated Admin Panel Code

Here is the revised React proposal for `components/admin/api-management-form.tsx` that incorporates the True Kill Switch, the missing module toggles, and the actual API submission wiring.

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function ApiManagementForm({ initialModels, systemConfig }: { initialModels: any[], systemConfig: any }) {
  // Existing state
  const [models, setModels] = useState<any[]>(initialModels);
  const [loading, setLoading] = useState(false);

  // Neural Parameters State
  const [auditStrictness, setAuditStrictness] = useState(systemConfig?.auditStrictness || 50);
  const [concurrencyLimit, setConcurrencyLimit] = useState(systemConfig?.concurrencyLimit || 2);
  const [deepSearchCap, setDeepSearchCap] = useState(systemConfig?.deepSearchCap || 8000);

  // Missing Module Toggles State
  const [enableSkillscript, setEnableSkillscript] = useState(systemConfig?.enableSkillscript ?? true);
  const [enableGraphify, setEnableGraphify] = useState(systemConfig?.enableGraphify ?? true);
  const [enableDeepSearch, setEnableDeepSearch] = useState(systemConfig?.enableDeepSearch ?? true);

  // TRUE Kill Switch Handler
  const handleKillSwitch = async () => {
    if(!confirm("CRITICAL WARNING: This will immediately emit an AbortController signal to terminate ALL active Master/Worker LLM streams. Proceed?")) return;
    try {
      const res = await fetch("/api/admin/kill-switch", { method: "POST" });
      if (res.ok) toast.success("All active neural threads aborted.");
      else toast.error("Failed to abort threads.");
    } catch(e) {
      toast.error("Network error executing kill switch.");
    }
  };

  // Database Memory Wipe Handler
  const handleGraphWipe = async () => {
    if(!confirm("DANGER: Are you sure you want to flush all neural context nodes? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/admin/wipe-graph", { method: "POST" });
      if (res.ok) toast.success("Graph Memory Wiped Successfully.");
      else toast.error("Failed to wipe graph.");
    } catch(e) {
      toast.error("Network error wiping graph.");
    }
  };

  const handleNeuralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        auditStrictness,
        concurrencyLimit,
        deepSearchCap,
        enableSkillscript,
        enableGraphify,
        enableDeepSearch
      };

      const res = await fetch("/api/config/update-neural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Update failed");
      toast.success("Neural Architecture config synchronized to DB.");
    } catch (err: any) {
      toast.error("Error saving config: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleNeuralSubmit} className="mt-10 space-y-8 rounded-xl border bg-card p-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-indigo-400">
              🧠 Neural Architecture & Telemetry
          </h3>
          <Button
            type="button"
            variant="destructive"
            className="animate-pulse shadow-red-500/50 hover:bg-red-700 font-bold tracking-widest"
            onClick={handleKillSwitch}
          >
            🛑 HALT ALL AGENTS (ABORT)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800 pt-6">

          {/* Left Column: Neural Settings */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300">TryAI Audit Strictness</label>
                <span className="font-mono text-xs text-indigo-400">{auditStrictness}%</span>
              </div>
              <p className="text-xs text-slate-500">Determines hallucination-rejection threshold.</p>
              <input type="range" min="0" max="100" value={auditStrictness} onChange={(e) => setAuditStrictness(Number(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Worker Node Concurrency</label>
              <p className="text-xs text-slate-500">Max parallel tasks before applying Jitter Queue.</p>
              <Input type="number" min={1} max={20} value={concurrencyLimit} onChange={(e) => setConcurrencyLimit(Number(e.target.value))} className="w-32 bg-slate-950 font-mono" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">DeepSearch Payload Cap (Chars)</label>
              <p className="text-xs text-slate-500">Truncates Jina AI scraped outputs to protect tokens.</p>
              <Input type="number" step={1000} min={1000} max={32000} value={deepSearchCap} onChange={(e) => setDeepSearchCap(Number(e.target.value))} className="w-48 bg-slate-950 font-mono" />
            </div>
          </div>

          {/* Right Column: Module Toggles & Danger Zone */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-lg bg-slate-900/50 p-4 border border-slate-800">
              <h4 className="text-sm font-bold text-slate-200">Module Access Routing</h4>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Skillscript</div>
                  <div className="text-xs text-slate-500">Allow Custom Runtime Overrides</div>
                </div>
                <Switch checked={enableSkillscript} onCheckedChange={setEnableSkillscript} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Graphify</div>
                  <div className="text-xs text-slate-500">Enable JSON Artifact Generation</div>
                </div>
                <Switch checked={enableGraphify} onCheckedChange={setEnableGraphify} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">DeepSearch Engine</div>
                  <div className="text-xs text-slate-500">Allow outbound Jina AI web scraping</div>
                </div>
                <Switch checked={enableDeepSearch} onCheckedChange={setEnableDeepSearch} />
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-red-500/20 bg-red-950/10 p-4">
              <label className="text-sm font-semibold text-red-400">Rowboat Graph Vector Store</label>
              <p className="mb-2 text-xs text-slate-500">Emergency wipe of all context nodes.</p>
              <Button type="button" variant="outline" className="w-fit border-red-500/50 text-red-400 hover:bg-red-900/50" onClick={handleGraphWipe}>
                Wipe Neural Memory
              </Button>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500">
          {loading ? "Synchronizing..." : "Save Config Matrix"}
        </Button>
      </div>
    </form>
  );
}
```
