"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createModel, deleteModel } from "@/actions/models";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  provider: z.string(),
  model_name: z.string().min(1),
  cost_per_million_input: z.coerce.number().min(0),
  cost_per_million_output: z.coerce.number().min(0),
  is_active: z.boolean().default(false),
  is_fallback_model: z.boolean().default(false),
});

export default function ModelsForm({ initialModels }: { initialModels: any[] }) {
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "OPENROUTER",
      model_name: "",
      cost_per_million_input: 0,
      cost_per_million_output: 0,
      is_active: false,
      is_fallback_model: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await createModel(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Model created successfully!");
        form.reset();
      }
    });
  }

  async function handleDelete(id: string) {
     if(confirm("Are you sure?")) {
         await deleteModel(id);
         toast.success("Deleted model");
     }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-md">
         <h3 className="mb-4 text-lg font-medium">Add New Model</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="provider" render={({ field }) => (
                <FormItem><FormLabel>Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="OPENROUTER">OpenRouter</SelectItem><SelectItem value="DIRECT_GEMINI">Direct Gemini</SelectItem></SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="model_name" render={({ field }) => (
                <FormItem><FormLabel>Model Name</FormLabel><FormControl><Input placeholder="e.g. gpt-4o" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="cost_per_million_input" render={({ field }) => (
                <FormItem><FormLabel>Cost per 1M Input ($)</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="cost_per_million_output" render={({ field }) => (
                <FormItem><FormLabel>Cost per 1M Output ($)</FormLabel><FormControl><Input type="number" step="0.0001" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none"><FormLabel>Premium (Active Quota)</FormLabel></div>
                </FormItem>
              )}/>

              <FormField control={form.control} name="is_fallback_model" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none"><FormLabel>Fallback (Cheap Throttled)</FormLabel></div>
                </FormItem>
              )}/>
            </div>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Add Model"}</Button>
          </form>
        </Form>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-lg font-medium">Model Registry</h3>
        <div className="space-y-2">
            {initialModels.map(model => (
                <div key={model.id} className="flex items-center justify-between rounded-md border border-white/10 p-4">
                    <div>
                        <p className="font-medium">{model.model_name} <span className="text-sm text-muted-foreground">({model.provider})</span></p>
                        <p className="text-sm text-muted-foreground">Input: ${model.cost_per_million_input} / Output: ${model.cost_per_million_output}</p>
                        <div className="mt-1 flex gap-2">
                            {model.is_active && <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400">Premium</span>}
                            {model.is_fallback_model && <span className="rounded-full bg-blue-900/50 px-2 py-0.5 text-xs text-blue-400">Fallback</span>}
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(model.id)}>Delete</Button>
                </div>
            ))}
            {initialModels.length === 0 && <p className="text-sm text-muted-foreground">No models found in registry.</p>}
        </div>
      </div>
    </div>
  );
}
