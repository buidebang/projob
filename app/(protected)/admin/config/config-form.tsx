"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
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
});

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
    },
  });

  const { watch } = form;
  const proMargin = watch("tier_pro_profit_margin") || 0;
  const proPrice = watch("pro_price") || 0;
  // Approximation of max tokens if a hypothetical $0.15 active model is used:
  const proMaxTokensEst = ((proPrice * (1 - (proMargin / 100))) / 0.15) * 1000000;

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

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
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

          <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Configuration"}</Button>
        </form>
      </Form>
    </div>
  );
}
