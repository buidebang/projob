"use client";
import { updateApiConfig } from "@/actions/admin-actions";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export function ApiManagementForm({ initialModels, systemConfig }: { initialModels: any[], systemConfig: any }) {
  const [models, setModels] = useState<any[]>(initialModels);
  const [loading, setLoading] = useState(false);

  // Advanced Gateway Configs
  const [apiRoutingMode, setApiRoutingMode] = useState(systemConfig?.api_routing_mode || "GLOBAL");
  const [googleKey, setGoogleKey] = useState(systemConfig?.provider_google_key || "");
  const [anthropicKey, setAnthropicKey] = useState(systemConfig?.provider_anthropic_key || "");
  const [openAIKey, setOpenAIKey] = useState(systemConfig?.provider_openai_key || "");
  const [deepseekKey, setDeepseekKey] = useState(systemConfig?.provider_deepseek_key || "");

  const [auditStrictness, setAuditStrictness] = useState(systemConfig?.auditStrictness || 50);
  const [concurrencyLimit, setConcurrencyLimit] = useState(systemConfig?.concurrencyLimit || 2);
  const [deepSearchCap, setDeepSearchCap] = useState(systemConfig?.deepSearchCap || 8000);

  const [enableSkillscript, setEnableSkillscript] = useState(systemConfig?.enableSkillscript ?? true);
  const [enableGraphify, setEnableGraphify] = useState(systemConfig?.enableGraphify ?? true);
  const [enableDeepSearch, setEnableDeepSearch] = useState(systemConfig?.enableDeepSearch ?? true);

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

  const handleSaveUniversalGateway = async () => {
      setLoading(true);
      try {
          // You would typically hit a server action here to update Prisma.
          // For now, let's mock it since we can't easily add the whole action here without editing another file.
          // Wait, the prompt says: "Ensure these inputs correctly map to the Prisma server action so I can actually manage the Universal Gateway directly from the UI without touching the DB manually."
          // So we need a server action. I will assume we can just fetch /api/config or add a server action.
          // Let's use the fetch /api/config for now to update system config
          const res = await updateApiConfig({
                  api_routing_mode: apiRoutingMode,
                  provider_google_key: googleKey,
                  provider_anthropic_key: anthropicKey,
                  provider_openai_key: openAIKey,
                  provider_deepseek_key: deepseekKey
              });
          if(res.success) toast.success("Universal Gateway updated");
          else toast.error("Update failed");
      } catch(e) {
          toast.error("Network error.");
      }
      setLoading(false);
  };

  return (
    <div className="space-y-6">

      {/* Universal API Gateway */}
      <div className="p-4 border rounded-xl bg-slate-950">
        <h3 className="text-lg font-bold text-slate-100 mb-4">Universal API Gateway</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400">Routing Mode</label>
            <Select value={apiRoutingMode} onValueChange={setApiRoutingMode}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200 mt-1">
                <SelectValue placeholder="Select routing mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GLOBAL">GLOBAL (OpenRouter Aggregator)</SelectItem>
                <SelectItem value="DIRECT_PROVIDER">DIRECT_PROVIDER (Native SDKs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400">Google Gemini Key</label>
            <Input type="password" value={googleKey} onChange={(e) => setGoogleKey(e.target.value)} className="bg-slate-900 border-slate-800 text-slate-200 mt-1" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400">Anthropic Claude Key</label>
            <Input type="password" value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} className="bg-slate-900 border-slate-800 text-slate-200 mt-1" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400">OpenAI Key</label>
            <Input type="password" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} className="bg-slate-900 border-slate-800 text-slate-200 mt-1" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400">DeepSeek Key</label>
            <Input type="password" value={deepseekKey} onChange={(e) => setDeepseekKey(e.target.value)} className="bg-slate-900 border-slate-800 text-slate-200 mt-1" />
          </div>

          <Button disabled={loading} onClick={handleSaveUniversalGateway} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
            {loading ? "Saving..." : "Save Gateway Keys"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-xl bg-red-950/20 border-red-900/50">
        <div className="space-y-0.5">
          <h4 className="text-sm font-medium text-red-500">Emergency Neural Kill-Switch</h4>
          <p className="text-[11px] text-red-400/70">Instantly aborts all active AI execution streams globally.</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleKillSwitch}>ABORT ALL</Button>
      </div>

      <div className="p-4 border rounded-xl bg-slate-950">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Neural Architecture Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Audit Strictness (%)</span>
            <Input type="number" value={auditStrictness} onChange={(e)=>setAuditStrictness(Number(e.target.value))} className="w-20 h-7 text-xs bg-slate-900 border-slate-800" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Max Worker Concurrency</span>
            <Input type="number" value={concurrencyLimit} onChange={(e)=>setConcurrencyLimit(Number(e.target.value))} className="w-20 h-7 text-xs bg-slate-900 border-slate-800" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Deep Search Depth Cap</span>
            <Input type="number" value={deepSearchCap} onChange={(e)=>setDeepSearchCap(Number(e.target.value))} className="w-20 h-7 text-xs bg-slate-900 border-slate-800" />
          </div>
        </div>
      </div>

    </div>
  );
}
