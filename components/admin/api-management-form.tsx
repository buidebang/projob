"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSystemConfig } from "@/actions/update-system-config";

export function ApiManagementForm({ initialModels, systemConfig }: { initialModels: any[], systemConfig: any }) {
  const [models, setModels] = useState<any[]>(initialModels);
  const [isEmergencyMode, setIsEmergencyMode] = useState(systemConfig?.isEmergencyMode || false);
  const [fallbackModelName, setFallbackModelName] = useState(systemConfig?.fallbackModelName || "gemini-1.5-flash");
  const [fallbackApiKeys, setFallbackApiKeys] = useState<string[]>(systemConfig?.fallbackApiKeys || [""]);

  const [loading, setLoading] = useState(false);

  const addKey = () => {
    setFallbackApiKeys([...fallbackApiKeys, ""]);
  };

  const updateKey = (index: number, value: string) => {
    const newKeys = [...fallbackApiKeys];
    newKeys[index] = value;
    setFallbackApiKeys(newKeys);
  };

  const removeKey = (index: number) => {
    const newKeys = fallbackApiKeys.filter((_, i) => i !== index);
    setFallbackApiKeys(newKeys.length ? newKeys : [""]);
  };

  const updateModel = (id: string, field: string, value: string) => {
    setModels(models.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const keys = fallbackApiKeys.filter(k => k.trim() !== "");
      await updateSystemConfig({
        isEmergencyMode,
        fallbackModelName,
        fallbackApiKeys: keys,
        models
      });
      alert("Config updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Error updating config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-8 rounded-xl border bg-card p-6">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            API & Model Management
        </h3>

        <div className="space-y-6">
            <h4 className="border-b pb-2 text-lg font-semibold">Registered AI Models Configuration</h4>
            {models.map((model) => (
                <div key={model.id} className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Model Name</label>
                        <Input value={model.model_name} readOnly className="bg-muted" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Provider</label>
                        <Input value={model.provider} readOnly className="bg-muted" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Status</label>
                        <Input value={model.is_active ? "Active" : "Inactive"} readOnly className="bg-muted" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Base URL</label>
                        <Input value={model.base_url || ""} onChange={(e) => updateModel(model.id, 'base_url', e.target.value)} placeholder="https://api..." />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted-foreground">API Key</label>
                        <Input value={model.api_key || ""} onChange={(e) => updateModel(model.id, 'api_key', e.target.value)} placeholder="Key..." type="password" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Constraints</label>
                        <Input value={model.constraints || ""} onChange={(e) => updateModel(model.id, 'constraints', e.target.value)} placeholder="e.g. max_tokens=2000" />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="border-t pt-8">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold text-red-500">Emergency Facade Mode (Broke Mode)</h3>
                <p className="text-sm text-muted-foreground">Activate fallback mechanisms to avoid API token costs.</p>
            </div>
            <Switch
                checked={isEmergencyMode}
                onCheckedChange={setIsEmergencyMode}
                className="data-[state=checked]:bg-red-500"
            />
        </div>

        {isEmergencyMode && (
          <div className="space-y-4 rounded-lg border border-red-500/20 bg-red-500/10 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium">Fallback Model Name (Any String)</label>
              <Input
                value={fallbackModelName}
                onChange={(e) => setFallbackModelName(e.target.value)}
                placeholder="e.g., gemini-1.5-flash, deepseek-coder"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Fallback API Keys (Free Keys for Rotation)</label>
              <div className="space-y-2">
                {fallbackApiKeys.map((key, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={key}
                      onChange={(e) => updateKey(index, e.target.value)}
                      placeholder="API Key..."
                      type="password"
                    />
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeKey(index)}>X</Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addKey}>
                + Add Another Key
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Configuration"}
      </Button>
    </form>
  );
}
