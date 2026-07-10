"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { saveKnowledge } from "@/actions/knowledge";

const formSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  rules_text: z.string().min(1, "Rules text is required"),
});

export default function KnowledgeForm() {
  const [isPending, startTransition] = React.useTransition();
  const [tokenCount, setTokenCount] = React.useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "",
      rules_text: "",
    },
  });

  const { watch } = form;
  const rulesText = watch("rules_text") || "";

  React.useEffect(() => {
    // Exact Token Estimator: ~4 characters per token
    setTokenCount(Math.ceil(rulesText.length / 4));
  }, [rulesText]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await saveKnowledge(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Knowledge base updated!");
        form.reset();
      }
    });
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        form.setValue("rules_text", text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
            <FormField control={form.control} name="platform" render={({ field }) => (
              <FormItem><FormLabel>Platform (e.g., Twitter, Instagram)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>

            <FormItem>
              <FormLabel>Upload RAG File (.txt, .md)</FormLabel>
              <FormControl>
                <Input type="file" accept=".txt,.md" onChange={handleFileUpload} />
              </FormControl>
              <FormDescription>Upload a file to automatically fill the rules text.</FormDescription>
            </FormItem>

            <FormField control={form.control} name="rules_text" render={({ field }) => (
              <FormItem><FormLabel>Rules Text</FormLabel>
              <FormControl><Textarea className="min-h-[200px]" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
          </div>

          <div className="rounded border border-indigo-500/50 bg-indigo-500/10 p-4">
            <p className="text-sm font-medium text-indigo-200">
              Token Guardrail Estimator:
            </p>
            <p className="mt-1 text-xs text-indigo-300">
              Estimated Tokens: {tokenCount.toLocaleString()}
            </p>
            {tokenCount > 50000 && (
              <p className="mt-2 text-sm font-bold text-red-500">
                Warning: Large files may cause AI &apos;Lost in the Middle&apos; amnesia and excessive API costs. Consider summarizing.
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Knowledge"}</Button>
        </form>
      </Form>
    </div>
  );
}
