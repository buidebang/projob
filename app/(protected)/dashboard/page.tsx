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
  HelpCircle,
  History,
  Lock,
  LogOut,
  Paperclip,
  Plus,
  RefreshCw,
  Share2,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

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

export default function ProtectedDashboardPage() {
  const { data: session, status } = useSession();

  // Unified Flow State Controls
  const [inputText, setInputText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["SEO Blog Payload"]);
  const pasteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const [selectedModel, setSelectedModel] = useState("Gemini 3.5 Flash");
  const [searchDepth, setSearchDepth] = useState("basic");

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [showKastraModal, setShowKastraModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [yieldOutput, setYieldOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  // File Reference Handlers
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);

  // Live Auditing Metrics State
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  // Psychological Conversion Parameters
  const [clickCount, setClickCount] = useState(0);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [decayBypassed, setDecayBypassed] = useState(false);
  const [conversionHistory, setConversionHistory] = useState<HistoryItem[]>([]);

  const platforms = [
    "YouTube Script",
    "Reddit Thread",
    "Telegram Post",
    "Instagram Copy",
    "TikTok Scenario",
    "Twitter / X",
    "LinkedIn Post",
    "SEO Blog Payload",
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem("projob_history_store");
    if (savedHistory) setConversionHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (yieldOutput && !isProcessing) {
      runAlgorithmicAudit(yieldOutput, "default");
      outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    //} else {
      setAuditData(null);
    }
  }, [yieldOutput, isProcessing]);

  const runAlgorithmicAudit = (text: string, platform: string) => {
    let score = 95;
    const checks: { label: string; passed: boolean; tip: string }[] = [];
    const warnings: string[] = [];
    const charCount = text.length;

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
      const hasFirstPerson = /\b(I|we|our|my|us|experience|footprint)\b/i.test(
        text,
      );
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

    const finalScore = Math.max(score, 15);
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

  // Background Job Polling mechanism
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (activeJobId && isProcessing) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/jobs/status?id=${activeJobId}`);
          const data = await res.json();

          if (data.status === "COMPLETED") {
            setJobProgress(100);
            setIsProcessing(false);
            setActiveJobId(null);

            // Map results back to UI
            if (data.result && data.result.finalOutputs) {
              const fetchedOutputs = data.result.finalOutputs;
              const mappedOutputs: Record<string, any> = {};

              Object.keys(fetchedOutputs).forEach((key) => {
                mappedOutputs[key] = {
                  textContent: fetchedOutputs[key].textContent,
                  seoScore: 98, // Mock or fetch actual
                  grammarAccuracy: 100,
                };
              });

              setYieldOutput(JSON.stringify(mappedOutputs));
            }

            clearInterval(intervalId);
          } else if (data.status === "FAILED") {
            setIsProcessing(false);
            setActiveJobId(null);
            clearInterval(intervalId);

            if (data.result?.action === "TRIGGER_KASTRA_APPROVAL") {
              setShowKastraModal(true);
            } else {
              console.error(
                data.result?.error || "Job failed during processing.",
              );
            }
          } else if (data.status === "PROCESSING") {
            setJobProgress(data.progress || 10);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000);
    }

    return () => clearInterval(intervalId);
  }, [activeJobId, isProcessing]);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const handleExecuteOrchestration = async () => {
    if (!inputText.trim() && !fileName) return;
    setIsProcessing(true);
    setYieldOutput("");

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    try {
      // Async Hand-Off Modification: Create Background Job
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType: "AI_GENERATION",
          payload: {
            inputText,
            fileBase64,
            fileMimeType,
            platforms: ["SEO Blog Payload"],
            tone: "professional",
            length: "medium",
            flashMode: false,
            guestMode: status !== "authenticated",
            searchDepth,
            maxSearchResults: searchDepth !== "none" ? 5 : 0,
            capacityMultiplier:
              session?.user?.tier === "MAX"
                ? 4
                : session?.user?.tier === "ULTRA"
                  ? 3
                  : session?.user?.tier === "PRO"
                    ? 2
                    : 1,
          },
        }),
      });

      const data = await response.json();

      if (response.status === 202) {
        setActiveJobId(data.jobId);
        setIsProcessing(true); // Keep processing true during polling
        return;
      } else if (response.status === 413) {
        // Stealth Upsell Intercept handling
        if (data && data.action === "TRIGGER_UPSELL") {
          setShowUpsellModal(true);
          setIsProcessing(false);
          return;
        }
      }

      // End Async Handoff
} catch (err: any) {
      setYieldOutput(
        `❌ [Data Stream Interrupted]: ${err.message}\nVerify your server configuration keys and environment matrix.`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setFileBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#020617] font-sans text-slate-100 selection:bg-cyan-500/20">
      {/* Sidebar: Historical Conversational Nodes */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="sticky top-0 z-40 flex h-screen w-72 shrink-0 flex-col justify-between border-r border-slate-900 bg-[#090d1f] p-4"
          >
            <div className="flex h-full flex-col gap-5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
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
    if (textAreaRef.current) textAreaRef.current.value = "";
                  setYieldOutput("");
                  setFileName(null);
                  setFileBase64(null);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] p-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-700"
              >
                <Plus size={14} /> New Production Workspace
              </button>

              <div className="flex grow flex-col gap-2 overflow-y-auto pr-1">
                <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <History size={12} /> Immutable Context Logs
                </span>
                {conversionHistory.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-slate-900 p-8 text-center text-[11px] italic text-slate-600">
                    No historic nodes found. Trigger a generation below.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {conversionHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setInputText(item.inputText);
                          // setSelectedPlatforms([item.platform]);
                          setSelectedModel(item.model);
                          setYieldOutput(item.output);
                        }}
                        className="flex w-full flex-col gap-1 rounded-xl border border-slate-900 bg-slate-950/40 p-2.5 text-left text-xs transition-all hover:bg-slate-900/40"
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

            <div className="flex flex-col gap-2 border-t border-slate-900 pt-4">
              {status === "loading" ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 p-2">
                  <div className="flex w-full items-center gap-2">
                    <div className="size-7 animate-pulse rounded-full bg-slate-800"></div>
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800"></div>
                  </div>
                  <div className="size-4 animate-pulse rounded bg-slate-800"></div>
                </div>
              ) : status === "authenticated" ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/50 p-2">
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
                  onClick={() => signIn("google")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] p-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-700"
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
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-slate-900 bg-[#020617]/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0f172a] px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:text-slate-200"
              >
                <History size={13} /> Logs
              </button>
            )}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-xl font-black tracking-tight text-transparent">
              ProJob Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="xs:block hidden rounded-xl border border-slate-900 bg-slate-950/80 px-3.5 py-1 text-right">
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
                onClick={() => signIn("google")}
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
                  className="max-w-xl rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-left font-mono text-xs leading-relaxed text-slate-300 shadow-md"
                  style={{ direction: "ltr" }}
                >
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Source Input Reference
                  </div>
                  {inputText}
                  {fileName && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400">
                      📎 Attached: {fileName}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phase 2: Live Yield Output and Structural Audit Scoreboard */}
            {(isProcessing || yieldOutput) && (
              <div className="flex flex-col gap-4">
                <div className="relative w-full rounded-2xl border border-slate-900/80 bg-[#070b19]/60 p-5 shadow-xl backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
                      <Sparkles
                        size={13}
                        className="animate-pulse text-cyan-400"
                      />{" "}
                      {"Optimization Matrix"}
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
                      <div className="flex animate-pulse flex-col gap-2 text-slate-600">
                        <span>
                          [Connecting Server Repurpose Gateway node...]
                        </span>
                        <span>
                          [Executing Live Automated Google Search
                          Synchronization...]
                        </span>
                        <span>
                          [Calculating Topical Information Gain Weights...]
                        </span>
                      </div>
                    ) : (
                      <textarea
                        value={yieldOutput}
                        onChange={(e) => setYieldOutput(e.target.value)}
                        className="scrollbar-none max-h-[400px] min-h-[140px] w-full resize-y border-none bg-transparent p-0 font-mono leading-relaxed text-cyan-300 focus:outline-none"
                      />
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
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-900 bg-[#070b19]/40 p-4 text-center md:col-span-4">
                        <span className="mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                          Audit Score
                        </span>
                        <div
                          className={`font-mono text-3xl font-black ${auditData.status === "excellent" ? "text-emerald-400" : auditData.status === "warning" ? "text-amber-400" : "text-rose-500"}`}
                        >
                          {auditData.score}%
                        </div>
                        <span className="mt-1 font-mono text-[9px] uppercase text-slate-600">
                          2026 Engine Bound
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 rounded-2xl border border-slate-900 bg-[#070b19]/40 p-4 md:col-span-8">
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
                            className="mt-1 flex items-center gap-1 border-t border-slate-900/60 pt-1.5 text-left font-mono text-[10px] text-rose-400"
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
        <footer className="z-20 shrink-0 border-t border-slate-900 bg-[#020617] p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            {/* Channel Selection Dock Row */}
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto scroll-smooth pb-1">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    if (selectedPlatforms.includes(p)) {
                      setSelectedPlatforms(selectedPlatforms.filter((pl) => pl !== p));
                    } else {
                      setSelectedPlatforms([...selectedPlatforms, p]);
                    }
                  }}
                  className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-[10px] font-black transition-all ${
                    selectedPlatforms.includes(p)
                      ? "border-slate-700/80 bg-slate-900 text-cyan-400 shadow-md"
                      : "border-slate-900 bg-slate-950/40 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar Structure */}
            <div className="relative flex flex-col gap-2 rounded-2xl border border-slate-800 bg-[#090d1f] p-2 shadow-lg shadow-black/40">
              <textarea
                ref={textAreaRef}
                defaultValue={inputText}
                onChange={(e) => {
                   if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
                   pasteTimeoutRef.current = setTimeout(() => {
                     setInputText(e.target.value);
                   }, 300);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleExecuteOrchestration();
                  }
                }}
                placeholder={`Ask ProJob to synthesize keywords & generate context for ${selectedPlatforms[0]}...`}
                className="h-12 max-h-24 w-full resize-none bg-transparent p-2 text-left text-xs leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none"
                style={{ direction: "ltr" }}
              />

              <div className="flex items-center justify-between border-t border-slate-900 px-1 pt-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-400">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Paperclip size={14} />
                  </label>
                  {fileName && (
                    <span className="rounded-md border border-cyan-500/20 bg-cyan-950/30 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                      {fileName.slice(0, 14)}...
                    </span>
                  )}
                  <button
                    onClick={() => setShowConfigMenu(!showConfigMenu)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-400"
                  >
                    <Sliders size={14} />
                  </button>
                </div>

                <button
                  onClick={handleExecuteOrchestration}
                  disabled={isProcessing}
                  className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10 transition-all active:scale-95 disabled:bg-slate-900 disabled:text-slate-700"
                >
                  {activeJobId ? (
                    <div className="absolute inset-x-2 -top-12 rounded border border-slate-700 bg-slate-900 p-2 text-center text-[10px] text-slate-300 shadow">
                      Background Job Processing: {jobProgress}%
                      <div className="mt-1 h-1 w-full overflow-hidden rounded bg-slate-800">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-500"
                          style={{ width: `${jobProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                  <ArrowUp
                    size={14}
                    className={isProcessing ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Expandable Meta Config Drawer Overlay */}
              {showConfigMenu && (
                <div className="absolute bottom-14 left-2 z-50 flex min-w-[200px] flex-col gap-2.5 rounded-xl border border-slate-800 bg-[#090d1f] p-3 text-left shadow-xl">
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

      {/* Security Action Required Modal (Kastra Guardrails) */}
      <AnimatePresence>
        {showKastraModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-red-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
            >
              <div className="flex flex-col gap-3 text-center">
                <AlertTriangle className="mx-auto text-red-500" size={32} />
                <h3 className="text-lg font-black text-slate-100">
                  Security Action Required
                </h3>
                <p className="text-sm text-slate-400">
                  Kastra Guardrail Intercept: High-risk action detected. The
                  Master model blueprint attempted to schedule massive parallel
                  tasks or massive token consumption. Automation is entirely
                  suspended.
                </p>
                <button
                  onClick={() => setShowKastraModal(false)}
                  className="mt-4 w-full rounded-xl bg-red-600 p-3 text-xs font-black text-slate-100 shadow-xl shadow-red-500/20 transition-transform hover:bg-red-500"
                >
                  APPROVE (Admin Only)
                </button>
                <button
                  onClick={() => setShowKastraModal(false)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-xs font-black text-slate-400 transition-transform hover:bg-slate-800"
                >
                  CANCEL JOB
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Strategic Conversion Upsell Modal Grid */}
      <AnimatePresence>
        {showUpsellModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowUpsellModal(false)}
                className="absolute right-4 top-4 font-mono text-sm text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
              <div className="flex flex-col gap-3 text-center">
                <span className="mx-auto w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
                  Performance Cap Reached
                </span>
                <h3 className="text-lg font-black text-slate-100">
                  Bypass Local Performance Decay
                </h3>
                <p
                  className="text-left text-xs leading-relaxed text-slate-400"
                  style={{ direction: "ltr" }}
                >
                  Your workspace query context threshold has triggered active
                  budget mitigation loops. Unlock deep semantic live web
                  research nodes and continuous highest-fidelity model
                  allocations immediately.
                </p>
                <div className="my-1 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left font-mono text-[10px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Deep Search Horizons:</span>
                    <span className="font-bold text-rose-400">
                      Throttled (Base)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Synthesis Resolution:</span>
                    <span className="font-bold text-rose-400">
                      Decay Active
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 text-slate-100">
                    <span>Unlocked Node Infrastructure:</span>
                    <span className="font-bold text-emerald-400">
                      Google Gemini Pro Core
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
                <span className="block text-[9px] leading-normal text-slate-600">
                  One-click transactional allocation routed via Stripe. Removes
                  local bandwidth execution caps instantly for 30 days.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
