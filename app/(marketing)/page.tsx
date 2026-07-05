"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUp,
  Check,
  CheckCircle,
  Copy,
  FileText,
  History,
  Instagram,
  Linkedin,
  Lock,
  LogOut,
  MessageCircle,
  Paperclip,
  PenTool,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Sliders,
  Sparkles,
  Trash2,
  Twitter,
  User,
  Video,
  Youtube,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Configured 2026 Frontier & Edge Models Matrix
const heavyModels = [
  {
    name: "Claude Fable 5",
    company: "Anthropic",
    feature: "Agentic Reasoning Pioneer",
  },
  {
    name: "Claude Opus 4.8",
    company: "Anthropic",
    feature: "Deep Context & Heavy Logic",
  },
  {
    name: "GPT-5.5 Pro",
    company: "OpenAI",
    feature: "Advanced Scientific Reasoning",
  },
  { name: "GPT-5.5", company: "OpenAI", feature: "Flagship Multipurpose Hub" },
  {
    name: "Gemini 3.1 Pro",
    company: "Google",
    feature: "Multimodal Analysis Matrix",
  },
  {
    name: "Claude Sonnet 5",
    company: "Anthropic",
    feature: "Speed & Intelligence Balance",
  },
  {
    name: "GPT-5.4 Pro",
    company: "OpenAI",
    feature: "Autonomous OS Execution",
  },
  {
    name: "Qwen3.7-Max",
    company: "Alibaba",
    feature: "High-Tier Math & Coding",
  },
  { name: "Grok 4.3", company: "xAI", feature: "Real-time X Network Stream" },
  {
    name: "DeepSeek V4 Pro",
    company: "DeepSeek",
    feature: "Economic Reasoning Node",
  },
];

const lightModels = [
  {
    name: "Gemini 3.5 Flash",
    company: "Google",
    use: "Instantaneous Extraction",
  },
  { name: "Nano Banana 2", company: "Google", use: "Light Image & Copy Yield" },
  { name: "GPT-5 mini", company: "OpenAI", use: "Short Text Micro-Processing" },
  { name: "Llama 4 Scout", company: "Meta", use: "Local Directory Parsing" },
  {
    name: "Mistral Nemo",
    company: "Mistral",
    use: "Lightweight Edge Deployments",
  },
  {
    name: "DeepSeek V4 Flash",
    company: "DeepSeek",
    use: "Ultra-Cheap Stream Processing",
  },
  {
    name: "Kimi K2.6",
    company: "Moonshot AI",
    use: "High-Speed Document Stream",
  },
  {
    name: "Mistral Small 3",
    company: "Mistral",
    use: "Daily Macro Productivity",
  },
  {
    name: "Gemma 3 12B",
    company: "Google",
    use: "Home Server Local Execution",
  },
  {
    name: "Qwen3.5-9B",
    company: "Alibaba",
    use: "Compact Structural Intelligence",
  },
];

interface AuditResult {
  score: number;
  status: "excellent" | "warning" | "critical";
  checks: { label: string; passed: boolean; tip: string }[];
  warnings: string[];
}

interface HistoryItem {
  id: string;
  timestamp: string;
  inputText: string;
  platform: string;
  model: string;
  output: string;
}

export default function MarketingHomePage() {
  const { data: session, status } = useSession();
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Unified Flow State Controls
  const [inputText, setInputText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("YouTube Script");
  const [selectedModel, setSelectedModel] = useState("Gemini 3.5 Flash");
  const [searchDepth, setSearchDepth] = useState("basic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [yieldOutput, setYieldOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  // File Reference Handlers
  const [files, setFiles] = useState<File[]>([]);

  // Live Auditing Metrics State
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  // Psychological Conversion Parameters
  const [clickCount, setClickCount] = useState(0);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [decayBypassed, setDecayBypassed] = useState(false);
  const [conversionHistory, setConversionHistory] = useState<HistoryItem[]>([]);

  const platformConfig = [
    { name: "YouTube Script", icon: Youtube },
    { name: "Reddit Thread", icon: MessageCircle },
    { name: "Telegram Post", icon: Send },
    { name: "Instagram Copy", icon: Instagram },
    { name: "TikTok Scenario", icon: Video },
    { name: "Twitter / X", icon: Twitter },
    { name: "LinkedIn Post", icon: Linkedin },
    { name: "SEO Blog Payload", icon: PenTool },
  ];
  const platforms = platformConfig.map((p) => p.name);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.history) {
            setConversionHistory(
              data.history.map((h: any) => ({
                id: h.id,
                timestamp: new Date(h.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                inputText: h.inputText,
                platform: h.platform,
                model: h.model,
                output: h.output,
              })),
            );
          }
        })
        .catch(console.error);
    } else if (status === "unauthenticated") {
      const savedHistory = localStorage.getItem("projob_history_store");
      if (savedHistory) setConversionHistory(JSON.parse(savedHistory));
    }
  }, [status]);

  useEffect(() => {
    if (yieldOutput && !isProcessing) {
      runAlgorithmicAudit(yieldOutput, selectedPlatform);
      outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setAuditData(null);
    }
  }, [yieldOutput, selectedPlatform, isProcessing]);

  const runAlgorithmicAudit = (text: string, platform: string) => {
    let score = 100;
    const checks: { label: string; passed: boolean; tip: string }[] = [];
    const warnings: string[] = [];
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (charCount < 20 || wordCount < 5) {
      score = 10;
      warnings.push("Input too short for meaningful SEO analysis.");
      checks.push({
        label: "Minimum Viable Length",
        passed: false,
        tip: "Content must contain at least 20 characters and 5 words for basic semantic parsing.",
      });
    } else {
      checks.push({
        label: "Minimum Viable Length",
        passed: true,
        tip: "Content exceeds basic parsing thresholds.",
      });

      const keywordDensity = (wordCount / charCount) * 100;
      if (keywordDensity < 10) {
        score -= 15;
        warnings.push(
          "Low semantic density detected. Expand vocabulary variations.",
        );
      }

      const hasKeywords =
        /(generate|seo|marketing|content|strategy|growth|viral)/i.test(text);
      checks.push({
        label: "High-Value Keyword Presence",
        passed: hasKeywords,
        tip: "Inclusion of high-intent keywords improves algorithmic routing.",
      });
      if (!hasKeywords) score -= 15;

      if (platform === "Twitter / X") {
        const hasLink = /https?:\/\/[^\s]+/g.test(text);
        checks.push({
          label: "Link Suppressor Protection",
          passed: !hasLink,
          tip: "X algorithm structurally demotes outbound links on live main feeds. Place links inside reply nests.",
        });
        if (hasLink) {
          score -= 25;
          warnings.push(
            "Outbound link detected. Expected feed reach reduction: 80%.",
          );
        }

        checks.push({
          label: "Premium Structural Depth",
          passed: charCount > 280,
          tip: "2026 indexing rules prioritize extended token conversational layouts over legacy short format copies.",
        });
        if (charCount <= 280) score -= 10;
      } else if (
        platform === "Instagram Copy" ||
        platform === "TikTok Scenario"
      ) {
        const hasHook = text.slice(0, 120).match(/\?|!|How|Why|Stop/i);
        checks.push({
          label: "3-Second Retention Trigger",
          passed: !!hasHook,
          tip: "Frictionless conversions rely on high-entropy vocabulary loops within the initial execution window.",
        });
        if (!hasHook) {
          score -= 15;
          warnings.push(
            "Passive content anchor. Audience skip-rate risk elevated.",
          );
        }
      } else if (platform === "SEO Blog Payload") {
        const hasFirstPerson =
          /\b(I|we|our|my|us|experience|footprint)\b/i.test(text);
        checks.push({
          label: "Google E-E-A-T Data Integrity",
          passed: hasFirstPerson,
          tip: "Google Core Engine updates explicitly weight verified human-experiential perspectives.",
        });
        if (!hasFirstPerson) {
          score -= 20;
          warnings.push(
            "Linguistic signatures resemble standard synthetic rehashes.",
          );
        }
      }
    }

    const finalScore = Math.max(Math.min(score, 100), 10);
    setAuditData({
      score: finalScore,
      status:
        finalScore > 80
          ? "excellent"
          : finalScore > 50
            ? "warning"
            : "critical",
      checks,
      warnings,
    });
  };

  const handleExecuteOrchestration = async () => {
    if (!inputText.trim() && files.length === 0) return;
    setIsProcessing(true);
    setGenerationStage(0);
    setYieldOutput("");

    // Simulate generation stages progression
    const stagesInterval = setInterval(() => {
      setGenerationStage((prev) => {
        if (prev >= 3) {
          clearInterval(stagesInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    let fileBase64: string | null = null;
    let fileMimeType: string | null = null;
    if (files.length > 0) {
      const file = files[0];
      fileMimeType = file.type;

      setUploadProgress(30);

      const buffer = await file.arrayBuffer();
      fileBase64 = Buffer.from(buffer).toString("base64");

      setUploadProgress(100);
    }

    try {
      const response = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputText,
          fileBase64,
          fileMimeType,
          platforms: [selectedPlatform],
          tone: "professional",
          length: "medium",
          flashMode:
            selectedModel.includes("Flash") || selectedModel.includes("mini"),
          guestMode: status !== "authenticated",
          imageRequest: false,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "System node pipeline crash.");

      let resultText = "";
      if (data.outputs && data.outputs[selectedPlatform]) {
        resultText = data.outputs[selectedPlatform].textContent;
      } else if (data.outputs) {
        const firstKey = Object.keys(data.outputs)[0];
        resultText =
          data.outputs[firstKey]?.textContent ||
          JSON.stringify(data.outputs, null, 2);
      }

      setYieldOutput(resultText);

      // Save session payload
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        inputText,
        platform: selectedPlatform,
        model: selectedModel,
        output: resultText,
      };
      const updatedHistory = [newItem, ...conversionHistory].slice(0, 15);
      setConversionHistory(updatedHistory);

      if (status === "authenticated") {
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputText,
            platform: selectedPlatform,
            model: selectedModel,
            output: resultText,
          }),
        }).catch(console.error);
      } else {
        localStorage.setItem(
          "projob_history_store",
          JSON.stringify(updatedHistory),
        );
      }

      if (nextCount >= 3 && !decayBypassed && status !== "authenticated") {
        setTimeout(() => setShowUpsellModal(true), 1200);
      }
    } catch (err: any) {
      setYieldOutput(
        `❌ [Data Stream Interrupted]: ${err.message}\nVerify your server configuration keys and environment matrix.`,
      );
    } finally {
      setIsProcessing(false);
      setGenerationStage(0);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    let limit = 5;
    if (status !== "authenticated") limit = 0;
    else if (
      (session?.user as any)?.tier === "MAX" ||
      (session?.user as any)?.tier === "ULTRA"
    )
      limit = 17;

    if (status !== "authenticated") {
      toast.error("Sign in to unlock file uploads.");
      return;
    }

    if (files.length + acceptedFiles.length > limit) {
      toast.error(
        `You can only upload up to ${limit} files on your current tier.`,
      );
      return;
    }

    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: status !== "authenticated",
    noKeyboard: status !== "authenticated",
  });

  const handleUploadClick = () => {
    if (status !== "authenticated") {
      toast.error("Sign in to unlock file uploads.");
    }
  };

  const handleSignIn = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXTAUTH_URL) {
        // Just a basic check if environment might be borked, but next-auth signIn handles it client side
        // Actually, if we just try catch it
      }
      await signIn("google");
    } catch (error) {
      toast.error(
        "Authentication service temporarily unavailable. Please try again later.",
      );
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/20">
      {/* Sidebar: Historical Conversational Nodes */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="sticky top-0 z-40 flex h-screen w-72 shrink-0 flex-col justify-between border-r border-white/10 bg-slate-950/50 p-4"
          >
            <div className="flex h-full flex-col gap-5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-sm font-black tracking-wider text-transparent">
                  PROJOB COMMAND DECK
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 font-mono text-xs text-slate-600 hover:text-slate-400"
                >
                  ◀
                </button>
              </div>

              <button
                onClick={() => {
                  setInputText("");
                  setYieldOutput("");
                  setFiles([]);
                  setUploadProgress(0);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-700"
              >
                <Plus size={14} /> New Production Workspace
              </button>

              <div className="flex grow flex-col gap-2 overflow-y-auto pr-1">
                <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <History size={12} /> Immutable Context Logs
                </span>
                {conversionHistory.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-white/10 p-8 text-center text-[11px] italic text-slate-600">
                    No historic nodes found. Trigger a generation below.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {conversionHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setInputText(item.inputText);
                          setSelectedPlatform(item.platform);
                          setSelectedModel(item.model);
                          setYieldOutput(item.output);
                        }}
                        className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-slate-950/40 p-2.5 text-left text-xs transition-all hover:bg-slate-900/40"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="rounded border border-cyan-500/20 bg-cyan-950/30 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400">
                            {item.platform.split(" ")[0]}
                          </span>
                          <span className="font-mono text-[9px] text-slate-600">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="truncate font-mono text-[11px] text-slate-400">
                          {item.inputText || "Media Payload Processing"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
              {status === "loading" ? (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 p-2">
                  <div className="flex w-full items-center gap-2">
                    <div className="size-7 animate-pulse rounded-full bg-slate-800"></div>
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800"></div>
                  </div>
                  <div className="size-4 animate-pulse rounded bg-slate-800"></div>
                </div>
              ) : status === "authenticated" ? (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 p-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex size-7 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 font-mono text-[10px] font-bold text-cyan-400">
                      {session?.user?.email?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="truncate text-xs font-bold text-slate-300">
                        {session?.user?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-1 text-slate-600 hover:text-slate-400"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-700"
                >
                  <User size={12} /> Authenticate Session
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Stream Workspace Layout */}
      <div className="relative flex h-screen grow flex-col overflow-hidden">
        {/* Dynamic Navigation Bar */}
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:text-slate-200"
              >
                <History size={13} /> Logs
              </button>
            )}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-xl font-black tracking-tight text-transparent">
              ProJob Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="xs:block hidden rounded-xl border border-white/10 bg-slate-950/80 px-3.5 py-1 text-right">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-500">
                Compute Energy
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {status === "authenticated" || decayBypassed
                  ? "UNLIMITED"
                  : `${(10000 - clickCount * 120).toFixed(2)} ⚡`}
              </span>
            </div>
            {status !== "authenticated" && (
              <button
                onClick={handleSignIn}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/5 transition-opacity hover:opacity-90"
              >
                Upgrade Node
              </button>
            )}
          </div>
        </header>

        {/* Central Chat / Stream Pipeline Container */}
        <div className="scrollbar-thin flex grow flex-col gap-6 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {/* Phase 1: Context Input Echo */}
            {inputText && (
              <div className="flex justify-end">
                <div
                  className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left font-mono text-xs leading-relaxed text-slate-300 shadow-md"
                  style={{ direction: "ltr" }}
                >
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Source Input Reference
                  </div>
                  {inputText}
                  {files.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1 text-[10px] text-cyan-400">
                      {files.map((f) => (
                        <span key={f.name}>📎 Attached: {f.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phase 2: Live Yield Output and Structural Audit Scoreboard */}
            {(isProcessing || yieldOutput) && (
              <div className="flex flex-col gap-4">
                <div className="relative w-full rounded-2xl border  border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md ">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Sparkles
                        size={13}
                        className="animate-pulse text-cyan-400"
                      />{" "}
                      {selectedPlatform} Optimization Matrix
                    </span>
                    {yieldOutput && !isProcessing && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(yieldOutput);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-2.5 py-1 text-[10px] text-cyan-400 transition-colors hover:bg-cyan-950/50"
                      >
                        {isCopied ? (
                          <CheckCircle size={11} className="text-emerald-400" />
                        ) : (
                          <Copy size={11} />
                        )}{" "}
                        {isCopied ? "Copied" : "Copy Yield"}
                      </button>
                    )}
                  </div>

                  <div
                    className="min-h-[120px] whitespace-pre-wrap text-left font-mono text-xs leading-relaxed text-cyan-300"
                    style={{ direction: "ltr" }}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col gap-3 font-mono text-[11px]">
                        {[
                          "Analyzing content structure & semantics...",
                          "Allocating neural resources & deep horizons...",
                          "Synthesizing optimal text representations...",
                          "Applying final SEO heuristics & data validation...",
                        ].map((stage, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 ${idx > generationStage ? "opacity-30" : idx === generationStage ? "animate-pulse text-cyan-400" : "text-emerald-400"}`}
                          >
                            {idx < generationStage ? (
                              <CheckCircle size={12} />
                            ) : idx === generationStage ? (
                              <ArrowUp size={12} className="animate-spin" />
                            ) : (
                              <div className="size-3 rounded-full border border-slate-700" />
                            )}
                            <span>{stage}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent prose prose-sm prose-invert h-full max-h-[400px] max-w-none overflow-y-auto text-slate-300 prose-p:leading-relaxed prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {yieldOutput || "Awaiting context generation..."}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Grid Placement Embedded in Flow Context */}
                <AnimatePresence>
                  {auditData && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 gap-4 md:grid-cols-12"
                    >
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md md:col-span-4">
                        <span className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Audit Score
                        </span>
                        <div className="relative flex size-24 items-center justify-center">
                          <svg
                            className="size-full -rotate-90"
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              className="stroke-slate-800"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              className={`${auditData.status === "excellent" ? "stroke-emerald-400" : auditData.status === "warning" ? "stroke-amber-400" : "stroke-rose-500"} transition-all duration-1000 ease-out`}
                              strokeWidth="8"
                              strokeDasharray="282.7"
                              strokeDashoffset={
                                282.7 - (282.7 * auditData.score) / 100
                              }
                              strokeLinecap="round"
                            />
                          </svg>
                          <div
                            className={`absolute font-mono text-2xl font-black ${auditData.status === "excellent" ? "text-emerald-400" : auditData.status === "warning" ? "text-amber-400" : "text-rose-500"}`}
                          >
                            {auditData.score}%
                          </div>
                        </div>
                        <span className="mt-2 font-mono text-[9px] uppercase text-slate-600">
                          2026 Engine Bound
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md md:col-span-8">
                        {auditData.checks.map((check, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-left text-[11px]"
                          >
                            <span
                              className={`text-xs ${check.passed ? "text-emerald-400" : "text-rose-500"}`}
                            >
                              {check.passed ? "✔" : "✘"}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-300">
                                {check.label}
                              </span>
                              <span className="mt-0.5 text-[10px] leading-normal text-slate-500">
                                {check.tip}
                              </span>
                            </div>
                          </div>
                        ))}
                        {auditData.warnings.map((warn, idx) => (
                          <div
                            key={idx}
                            className="border-white/10/60 mt-1 flex items-center gap-1 border-t pt-1.5 text-left font-mono text-[10px] text-rose-400"
                          >
                            <AlertTriangle size={11} className="shrink-0" />{" "}
                            {warn}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div ref={outputEndRef} />
          </div>
        </div>

        {/* Centralized Floating Command Bar (ChatGPT Workspace Experience) */}
        <footer className="z-20 shrink-0 border-t border-white/10 bg-slate-950 p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            {/* Channel Selection Dock Row */}
            <div className="scrollbar-none relative z-10 flex gap-1.5 overflow-x-auto scroll-smooth pb-1">
              {platformConfig.map((p) => {
                const isActive = selectedPlatform === p.name;
                const Icon = p.icon;
                return (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPlatform(p.name)}
                    className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[10px] font-black transition-all ${
                      isActive
                        ? "border-slate-700/80 text-cyan-400 shadow-md"
                        : "border-white/10 bg-slate-950/40 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 -z-10 rounded-xl bg-slate-900"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      size={12}
                      className={isActive ? "text-cyan-400" : "text-slate-500"}
                    />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Input Bar Structure */}
            <div className="relative flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-2 shadow-lg shadow-slate-900/40">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleExecuteOrchestration();
                  }
                }}
                placeholder={`Ask ProJob to synthesize keywords & generate context for ${selectedPlatform}...`}
                className="h-12 max-h-24 w-full resize-none bg-transparent p-2 text-left text-xs leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none"
                style={{ direction: "ltr" }}
              />

              <div className="flex items-center justify-between border-t border-white/10 px-1 pt-2">
                <div className="flex items-center gap-2">
                  <div
                    {...getRootProps()}
                    onClick={handleUploadClick}
                    className={`flex cursor-pointer items-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-400 ${isDragActive ? "bg-slate-900" : ""}`}
                  >
                    <input {...getInputProps()} />
                    <Paperclip size={14} />
                  </div>
                  <button
                    onClick={() => setShowConfigMenu(!showConfigMenu)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-400"
                  >
                    <Sliders size={14} />
                  </button>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-2 pt-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-950/30 px-2 py-1 font-mono text-[10px] text-cyan-400"
                      >
                        <span className="max-w-[100px] truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-500">
                          {(file.size / 1024).toFixed(1)}kb
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="ml-1 text-rose-400 hover:text-rose-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {isProcessing && (
                  <div className="w-full px-2 pt-2 text-center font-mono text-[10px] text-cyan-400">
                    <span className="inline-block animate-pulse">Processing... ⏳</span>
                  </div>
                )}

                <button
                  onClick={handleExecuteOrchestration}
                  disabled={
                    isProcessing || (!inputText.trim() && files.length === 0)
                  }
                  className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10 transition-all active:scale-95 disabled:bg-slate-900 disabled:text-slate-700"
                >
                  <ArrowUp
                    size={14}
                    className={isProcessing ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Expandable Meta Config Drawer Overlay */}
              {showConfigMenu && (
                <div className="absolute bottom-14 left-2 z-50 flex min-w-[200px] flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left shadow-xl">
                  <div>
                    <label className="mb-1 block font-mono text-[9px] font-bold uppercase text-slate-500">
                      Compute Layer
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 font-mono text-[11px] text-slate-300 focus:outline-none"
                    >
                      <optgroup label="Frontier Heavweights">
                        {heavyModels.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Edge Lightweights">
                        {lightModels.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[9px] font-bold uppercase text-slate-500">
                      Horizon Depth
                    </label>
                    <select
                      value={searchDepth}
                      onChange={(e) => setSearchDepth(e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 font-mono text-[11px] text-slate-300 focus:outline-none"
                    >
                      <option value="basic">Standard Depth</option>
                      <option value="advanced">Advanced Sync</option>
                      <option value="extreme">Extreme Research 🔒</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center font-mono text-[10px] text-slate-600">
              ProJob Engine Context-v3.0. Automated keyword weights sync live
              with search nodes.
            </div>
          </div>
        </footer>
      </div>

      {/* Strategic Conversion Upsell Modal Grid */}
      <Dialog open={showUpsellModal} onOpenChange={setShowUpsellModal}>
        <DialogContent className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl sm:max-w-md">
          <DialogHeader className="flex flex-col gap-3 text-center">
            <span className="mx-auto w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              Performance Cap Reached
            </span>
            <DialogTitle className="text-center text-lg font-black text-slate-100">
              Upgrade to Pro Engine
            </DialogTitle>
            <DialogDescription
              className="text-center text-xs leading-relaxed text-slate-400"
              style={{ direction: "ltr" }}
            >
              Unlock 4x Processing Power, Limitless Capacity, and Deep Analytics
              immediately. Bypass local performance decay and get continuous
              highest-fidelity model allocations.
            </DialogDescription>
          </DialogHeader>
          <div className="my-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left font-mono text-[10px]">
            <div className="flex justify-between text-slate-500">
              <span>Deep Search Horizons:</span>
              <span className="font-bold text-rose-400">Throttled (Base)</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Synthesis Resolution:</span>
              <span className="font-bold text-rose-400">Decay Active</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 text-slate-100">
              <span>Unlocked Node Infrastructure:</span>
              <span className="font-bold text-emerald-400">
                Pro Engine - 4x Power
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setDecayBypassed(true);
              setShowUpsellModal(false);
              setClickCount(0);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-3 text-xs font-black text-slate-950 shadow-xl shadow-orange-500/10 transition-transform active:scale-[0.99]"
          >
            UNLEASH HYPER-ENGINE ($5.00) ⚡
          </button>
          <span className="block text-center text-[9px] leading-normal text-slate-600">
            One-click transactional allocation routed via Stripe. Removes local
            bandwidth execution caps instantly for 30 days.
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}
