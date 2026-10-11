"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateSystemConfig } from "@/actions/system-config";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  tier_guest_profit_margin: z.coerce.number().min(0).max(100),
  tier_basic_profit_margin: z.coerce.number().min(0).max(100),
  tier_pro_profit_margin: z.coerce.number().min(0).max(100),
  tier_max_profit_margin: z.coerce.number().min(0).max(100),
  quota_cycle_type: z.string(),
  soft_throttle_reduction_percent: z.coerce.number().min(0).max(100),
  pro_price: z.coerce.number().min(0),
  max_price: z.coerce.number().min(0),
  global_ai_generation_enabled: z.boolean(),
  deep_search_enabled: z.boolean(),
  ai_base_url: z.string().optional(),
  ai_auth_header_type: z.string().optional(),
  ai_target_model_id: z.string().optional(),

  api_routing_mode: z.string().optional(),
  global_aggregator_key: z.string().optional(),
  provider_google_key: z.string().optional(),
  provider_anthropic_key: z.string().optional(),
  provider_openai_key: z.string().optional(),

  commercial_tier_matrix: z.any()
});

const ALL_TIERS = ["guest", "free", "starter", "pro", "ultra"];
const AVAILABLE_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.5-flash", "gemini-3.1-pro", "gpt-4o", "gpt-4o-mini", "gpt-5.5", "claude-3-haiku", "claude-3-opus", "claude-3-sonnet"];

export default function ConfigForm({ initialConfig }: { initialConfig: any }) {
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tier_guest_profit_margin: initialConfig.tier_guest_profit_margin || 0,
      tier_basic_profit_margin: initialConfig.tier_basic_profit_margin || 0,
      tier_pro_profit_margin: initialConfig.tier_pro_profit_margin || 70,
      tier_max_profit_margin: initialConfig.tier_max_profit_margin || 85,
      quota_cycle_type: initialConfig.quota_cycle_type || "WEEKLY",
      soft_throttle_reduction_percent: initialConfig.soft_throttle_reduction_percent || 80,
      pro_price: initialConfig.pro_price || 5.0,
      max_price: initialConfig.max_price || 70.0,
      global_ai_generation_enabled: initialConfig.global_ai_generation_enabled ?? true,
      deep_search_enabled: initialConfig.deep_search_enabled ?? true,
      ai_base_url: initialConfig.ai_base_url || "",
      ai_auth_header_type: initialConfig.ai_auth_header_type || "Bearer",
      ai_target_model_id: initialConfig.ai_target_model_id || "",
      api_routing_mode: initialConfig.api_routing_mode || "GLOBAL",
      global_aggregator_key: "",
      provider_google_key: "",
      provider_anthropic_key: "",
      provider_openai_key: "",
      commercial_tier_matrix: initialConfig.commercial_tier_matrix || {
          models: { guest: "gemini-3.5-flash", free: "gemini-3.5-flash", starter: "gpt-4o-mini", pro: "gemini-3.1-pro", ultra: "gpt-5.5" },
          tools: { image: ["pro", "ultra"], chatpdf: ["starter", "pro", "ultra"], mindmap: ["ultra"], web: ["pro", "ultra"] }
      }
    },
  });

  const { watch, setValue, getValues } = form;
  const proMargin = watch("tier_pro_profit_margin") || 0;
  const proPrice = watch("pro_price") || 0;
  const routingMode = watch("api_routing_mode");
  const proMaxTokensEst = ((proPrice * (1 - (proMargin / 100))) / 0.15) * 1000000;

  const matrix = watch("commercial_tier_matrix");

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateSystemConfig(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("System configuration updated!");
      }
    });
  }

  const handleToolToggle = (toolKey: string, tier: string, checked: boolean) => {
     const currentMatrix = getValues("commercial_tier_matrix");
     const currentTiers = currentMatrix.tools[toolKey] || [];

     if (checked) {
         currentMatrix.tools[toolKey] = [...new Set([...currentTiers, tier])];
     } else {
         currentMatrix.tools[toolKey] = currentTiers.filter((t: string) => t !== tier);
     }
     setValue("commercial_tier_matrix", { ...currentMatrix }, { shouldValidate: true, shouldDirty: true });
  };

  const handleModelChange = (tier: string, model: string) => {
     const currentMatrix = getValues("commercial_tier_matrix");
     currentMatrix.models[tier] = model;
     setValue("commercial_tier_matrix", { ...currentMatrix }, { shouldValidate: true, shouldDirty: true });
  }

  const renderTierCheckboxes = (toolKey: string, label: string) => (
    <div className="mb-4">
      <div className="mb-2">
        <FormLabel className="text-base">{label}</FormLabel>
        <FormDescription>Select which tiers have access. Unselected tiers will show this tool as locked/upsell triggers.</FormDescription>
      </div>
      <div className="flex flex-row gap-4">
        {ALL_TIERS.map((tier) => {
            const isChecked = (matrix.tools[toolKey] || []).includes(tier);
            return (
              <div key={tier} className="flex flex-row items-start space-x-3 space-y-0">
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToolToggle(toolKey, tier, checked === true)}
                />
                <FormLabel className="font-normal capitalize">{tier}</FormLabel>
              </div>
            );
        })}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-md mb-24">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <div className="mt-8 rounded-xl border border-white/10 p-6">
             <h3 className="mb-4 text-lg font-medium text-blue-400">Universal API Key Manager</h3>
             <FormField control={form.control} name="api_routing_mode" render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Routing Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Global Aggregator (e.g. OpenRouter)</SelectItem>
                      <SelectItem value="DIRECT">Direct Provider Mode</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>

             <div className="grid grid-cols-1 gap-4">
               {routingMode === "GLOBAL" && (
                 <FormField control={form.control} name="global_aggregator_key" render={({ field }) => (
                   <FormItem><FormLabel>Global Aggregator API Key</FormLabel><FormControl><Input type="password" placeholder={initialConfig.global_aggregator_key ? "•••••••••••• (Encrypted in DB)" : "sk-or-v1-..."} {...field} /></FormControl><FormMessage /></FormItem>
                 )}/>
               )}
               {routingMode === "DIRECT" && (
                 <>
                   <FormField control={form.control} name="provider_google_key" render={({ field }) => (
                     <FormItem><FormLabel>Google Gemini API Key</FormLabel><FormControl><Input type="password" placeholder={initialConfig.provider_google_key ? "•••••••••••• (Encrypted in DB)" : "AIza..."} {...field} /></FormControl><FormMessage /></FormItem>
                   )}/>
                   <FormField control={form.control} name="provider_anthropic_key" render={({ field }) => (
                     <FormItem><FormLabel>Anthropic API Key</FormLabel><FormControl><Input type="password" placeholder={initialConfig.provider_anthropic_key ? "•••••••••••• (Encrypted in DB)" : "sk-ant-..."} {...field} /></FormControl><FormMessage /></FormItem>
                   )}/>
                   <FormField control={form.control} name="provider_openai_key" render={({ field }) => (
                     <FormItem><FormLabel>OpenAI API Key</FormLabel><FormControl><Input type="password" placeholder={initialConfig.provider_openai_key ? "•••••••••••• (Encrypted in DB)" : "sk-proj-..."} {...field} /></FormControl><FormMessage /></FormItem>
                   )}/>
                 </>
               )}
             </div>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 p-6">
             <h3 className="mb-4 text-lg font-medium text-emerald-400">Tier-Model-Tool Access Matrix</h3>
             <h4 className="mb-2 font-medium text-sm text-slate-300">Model Routing by Tier</h4>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
               {ALL_TIERS.map(tier => (
                 <div key={tier} className="flex flex-col gap-2">
                     <FormLabel className="capitalize">{tier} Model</FormLabel>
                     <Select value={matrix.models[tier] || ""} onValueChange={(val) => handleModelChange(tier, val)}>
                        <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                     </Select>
                 </div>
               ))}
             </div>

             <h4 className="mb-4 font-medium text-sm text-slate-300">MCP Tool Access Matrix (Locked features act as upsell triggers)</h4>
             <div className="flex flex-col gap-6 p-4 border border-white/5 bg-black/20 rounded-lg">
                {renderTierCheckboxes("image", "AI Image Generator")}
                {renderTierCheckboxes("chatpdf", "ChatPDF")}
                {renderTierCheckboxes("mindmap", "AI Mind Map Maker")}
                {renderTierCheckboxes("web", "Real-Time Web Access")}
             </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="global_ai_generation_enabled" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none"><FormLabel>Global AI Generation: ON/OFF</FormLabel></div>
              </FormItem>
            )}/>
            <FormField control={form.control} name="deep_search_enabled" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none"><FormLabel>Deep Search Module: ON/OFF</FormLabel></div>
              </FormItem>
            )}/>
            <FormField control={form.control} name="quota_cycle_type" render={({ field }) => (
              <FormItem><FormLabel>Quota Cycle Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="WEEKLY">Weekly</SelectItem><SelectItem value="MONTHLY">Monthly</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="soft_throttle_reduction_percent" render={({ field }) => (
              <FormItem><FormLabel>Soft Throttle Reduction (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="pro_price" render={({ field }) => (
              <FormItem><FormLabel>Pro Target Price ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="tier_pro_profit_margin" render={({ field }) => (
              <FormItem><FormLabel>Pro Target Margin (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="max_price" render={({ field }) => (
              <FormItem><FormLabel>Max Target Price ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="tier_max_profit_margin" render={({ field }) => (
              <FormItem><FormLabel>Max Target Margin (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
          </div>

          <div className="rounded border border-indigo-500/50 bg-indigo-500/10 p-4">
            <p className="text-sm font-medium text-indigo-200">
              Real-time Profit Calculator (Pro Tier):
            </p>
            <p className="mt-1 text-xs text-indigo-300">
              At a {proMargin}% margin on ${proPrice}, utilizing a hypothetical active model ($0.15/1M), this tier will autonomously grant ~{proMaxTokensEst.toLocaleString(undefined, {maximumFractionDigits: 0})} max tokens per {form.getValues('quota_cycle_type').toLowerCase()}.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Saving..." : "Save Configuration"}</Button>
        </form>
      </Form>
    </div>
  );
}
