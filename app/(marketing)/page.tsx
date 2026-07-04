"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  Sparkles, 
  History, 
  FileText, 
  Share2, 
  Copy, 
  Check, 
  Trash2, 
  Lock, 
  RefreshCw, 
  AlertTriangle, 
  Plus, 
  User,
  LogOut,
  Paperclip,
  ArrowUp,
  Sliders,
  CheckCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";

// Configured 2026 Frontier & Edge Models Matrix
const heavyModels = [
  { name: "Claude Fable 5", company: "Anthropic", feature: "Agentic Reasoning Pioneer" },
  { name: "Claude Opus 4.8", company: "Anthropic", feature: "Deep Context & Heavy Logic" },
  { name: "GPT-5.5 Pro", company: "OpenAI", feature: "Advanced Scientific Reasoning" },
  { name: "GPT-5.5", company: "OpenAI", feature: "Flagship Multipurpose Hub" },
  { name: "Gemini 3.1 Pro", company: "Google", feature: "Multimodal Analysis Matrix" },
  { name: "Claude Sonnet 5", company: "Anthropic", feature: "Speed & Intelligence Balance" },
  { name: "GPT-5.4 Pro", company: "OpenAI", feature: "Autonomous OS Execution" },
  { name: "Qwen3.7-Max", company: "Alibaba", feature: "High-Tier Math & Coding" },
  { name: "Grok 4.3", company: "xAI", feature: "Real-time X Network Stream" },
  { name: "DeepSeek V4 Pro", company: "DeepSeek", feature: "Economic Reasoning Node" }
];

const lightModels = [
  { name: "Gemini 3.5 Flash", company: "Google", use: "Instantaneous Extraction" },
  { name: "Nano Banana 2", company: "Google", use: "Light Image & Copy Yield" },
  { name: "GPT-5 mini", company: "OpenAI", use: "Short Text Micro-Processing" },
  { name: "Llama 4 Scout", company: "Meta", use: "Local Directory Parsing" },
  { name: "Mistral Nemo", company: "Mistral", use: "Lightweight Edge Deployments" },
  { name: "DeepSeek V4 Flash", company: "DeepSeek", use: "Ultra-Cheap Stream Processing" },
  { name: "Kimi K2.6", company: "Moonshot AI", use: "High-Speed Document Stream" },
  { name: "Mistral Small 3", company: "Mistral", use: "Daily Macro Productivity" },
  { name: "Gemma 3 12B", company: "Google", use: "Home Server Local Execution" },
  { name: "Qwen3.5-9B", company: "Alibaba", use: "Compact Structural Intelligence" }
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
    "YouTube Script", "Reddit Thread", "Telegram Post", "Instagram Copy",
    "TikTok Scenario", "Twitter / X", "LinkedIn Post", "SEO Blog Payload"
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem("projob_history_store");
    if (savedHistory) setConversionHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (yieldOutput && !isProcessing) {
      runAlgorithmicAudit(yieldOutput, selectedPlatform);
      outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setAuditData(null);
    }
  }, [yieldOutput, selectedPlatform, isProcessing]);

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
        tip: "X algorithm structurally demotes outbound links on live main feeds. Place links inside reply nests."
      });
      if (hasLink) { score -= 25; warnings.push("Outbound link detected. Expected feed reach reduction: 80%."); }
      
      checks.push({
        label: "Premium Structural Depth",
        passed: charCount > 280,
        tip: "2026 indexing rules prioritize extended token conversational layouts over legacy short format copies."
      });
      if (charCount <= 280) score -= 10;

    } else if (platform === "Instagram Copy" || platform === "TikTok Scenario") {
      const hasHook = text.slice(0, 120).match(/\?|!|How|Why|Stop/i);
      checks.push({
        label: "3-Second Retention Trigger",
        passed: !!hasHook,
        tip: "Frictionless conversions rely on high-entropy vocabulary loops within the initial execution window."
      });
      if (!hasHook) { score -= 15; warnings.push("Passive content anchor. Audience skip-rate risk elevated."); }
    } else if (platform === "SEO Blog Payload") {
      const hasFirstPerson = /\b(I|we|our|my|us|experience|footprint)\b/i.test(text);
      checks.push({
        label: "Google E-E-A-T Data Integrity",
        passed: hasFirstPerson,
        tip: "Google Core Engine updates explicitly weight verified human-experiential perspectives."
      });
      if (!hasFirstPerson) { score -= 20; warnings.push("Linguistic signatures resemble standard synthetic rehashes."); }
    }

    const finalScore = Math.max(score, 15);
    setAuditData({
      score: finalScore,
      status: finalScore > 80 ? "excellent" : finalScore > 50 ? "warning" : "critical",
      checks,
      warnings
    });
  };

  const handleExecuteOrchestration = async () => {
    if (!inputText.trim() && !fileName) return;
    setIsProcessing(true);
    setYieldOutput("");
    
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

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
          flashMode: selectedModel.includes("Flash") || selectedModel.includes("mini"),
          guestMode: status !== "authenticated",
          imageRequest: false
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "System node pipeline crash.");

      let resultText = "";
      if (data.outputs && data.outputs[selectedPlatform]) {
        resultText = data.outputs[selectedPlatform].textContent;
      } else if (data.outputs) {
        const firstKey = Object.keys(data.outputs)[0];
        resultText = data.outputs[firstKey]?.textContent || JSON.stringify(data.outputs, null, 2);
      }

      setYieldOutput(resultText);

      // Save session payload to local historical states
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        inputText,
        platform: selectedPlatform,
        model: selectedModel,
        output: resultText
      };
      const updatedHistory = [newItem, ...conversionHistory].slice(0, 15);
      setConversionHistory(updatedHistory);
      localStorage.setItem("projob_history_store", JSON.stringify(updatedHistory));

      if (nextCount >= 3 && !decayBypassed && status !== "authenticated") {
        setTimeout(() => setShowUpsellModal(true), 1200);
      }
    } catch (err: any) {
      setYieldOutput(`❌ [Data Stream Interrupted]: ${err.message}\nVerify your server configuration keys and environment matrix.`);
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
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex overflow-hidden selection:bg-cyan-500/20">
      
      {/* Sidebar: Historical Conversational Nodes */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 35 }}
            className="w-72 bg-[#090d1f] border-r border-slate-900 flex flex-col justify-between p-4 z-40 shrink-0 h-screen sticky top-0"
          >
            <div className="flex flex-col gap-5 overflow-hidden h-full">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <span className="text-sm font-black tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">PROJOB COMMAND DECK</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-600 hover:text-slate-400 p-1 font-mono text-xs">◀</button>
              </div>

              <button
                onClick={() => { setInputText(""); setYieldOutput(""); setFileName(null); setFileBase64(null); }}
                className="w-full flex items-center justify-center gap-2 bg-[#0f172a] border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-xs font-bold text-slate-200 transition-colors"
              >
                <Plus size={14} /> New Production Workspace
              </button>

              <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5 mb-1 font-mono">
                  <History size={12} /> Immutable Context Logs
                </span>
                {conversionHistory.length === 0 ? (
                  <div className="text-[11px] text-slate-600 italic text-center p-8 border border-dashed border-slate-900 rounded-xl mt-2">
                    No historic nodes found. Trigger a generation below.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {conversionHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setInputText(item.inputText); setSelectedPlatform(item.platform); setSelectedModel(item.model); setYieldOutput(item.output); }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900 transition-all flex flex-col gap-1 text-xs"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-mono text-[9px] text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                            {item.platform.split(" ")[0]}
                          </span>
                          <span className="text-[9px] text-slate-600 font-mono">{item.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate font-mono">{item.inputText || "Media Payload Processing"}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 flex flex-col gap-2">
              {status === "authenticated" ? (
                <div className="flex items-center justify-between bg-slate-950/50 border border-slate-900 p-2 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-[10px] font-bold font-mono">
                      {session?.user?.email?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="text-xs font-bold text-slate-300 truncate">{session?.user?.name}</span>
                    </div>
                  </div>
                  <button onClick={() => signOut()} className="text-slate-600 hover:text-slate-400 p-1"><LogOut size={13} /></button>
                </div>
              ) : (
                <button onClick={() => signIn("google")} className="w-full bg-[#0f172a] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold p-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <User size={12} /> Authenticate Session
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Stream Workspace Layout */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
        
        {/* Dynamic Navigation Bar */}
        <header className="px-6 py-4 border-b border-slate-900 bg-[#020617]/90 backdrop-blur-md flex justify-between items-center z-30 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center gap-1.5 bg-[#0f172a] border border-slate-800 px-3 py-1.5 rounded-xl transition-colors">
                <History size={13} /> Logs
              </button>
            )}
            <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">ProJob Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-950/80 border border-slate-900 px-3.5 py-1 rounded-xl text-right hidden xs:block">
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">Compute Energy</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {status === "authenticated" || decayBypassed ? "UNLIMITED" : `${(10000 - clickCount * 120).toFixed(2)} ⚡`}
              </span>
            </div>
            {status !== "authenticated" && (
              <button onClick={() => signIn("google")} className="bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl hover:opacity-90 shadow-lg shadow-cyan-500/5 transition-opacity">
                Upgrade Node
              </button>
            )}
          </div>
        </header>

        {/* Central Chat / Stream Pipeline Container */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scrollbar-thin">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
            
            {/* Phase 1: Context Input Echo */}
            {inputText && (
              <div className="flex justify-end">
                <div className="bg-[#0f172a] border border-slate-800 max-w-xl rounded-2xl px-4 py-3 text-xs text-slate-300 leading-relaxed font-mono shadow-md text-left" style={{ direction: "ltr" }}>
                  <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">Source Input Reference</div>
                  {inputText}
                  {fileName && <div className="text-[10px] text-cyan-400 mt-2 flex items-center gap-1">📎 Attached: {fileName}</div>}
                </div>
              </div>
            )}

            {/* Phase 2: Live Yield Output and Structural Audit Scoreboard */}
            {(isProcessing || yieldOutput) && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#070b19]/60 border border-slate-900/80 w-full rounded-2xl p-5 shadow-xl relative backdrop-blur-xl">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-400 animate-pulse" /> {selectedPlatform} Optimization Matrix
                    </span>
                    {yieldOutput && !isProcessing && (
                      <button onClick={() => { navigator.clipboard.writeText(yieldOutput); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="text-[10px] text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-cyan-950/50 transition-colors">
                        {isCopied ? <CheckCircle size={11} className="text-emerald-400" /> : <Copy size={11} />} {isCopied ? "Copied" : "Copy Yield"}
                      </button>
                    )}
                  </div>

                  <div className="font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre-wrap text-left min-h-[120px]" style={{ direction: "ltr" }}>
                    {isProcessing ? (
                      <div className="flex flex-col gap-2 text-slate-600 animate-pulse">
                        <span>[Connecting Server Repurpose Gateway node...]</span>
                        <span>[Executing Live Automated Google Search Synchronization...]</span>
                        <span>[Calculating Topical Information Gain Weights...]</span>
                      </div>
                    ) : (
                      <textarea
                        value={yieldOutput}
                        onChange={(e) => setYieldOutput(e.target.value)}
                        className="w-full min-h-[140px] max-h-[400px] bg-transparent text-cyan-300 border-none resize-y focus:outline-none leading-relaxed p-0 scrollbar-none font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* Audit Grid Placement Embedded in Flow Context */}
                <AnimatePresence>
                  {auditData && !isProcessing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4 bg-[#070b19]/40 border border-slate-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">Audit Score</span>
                        <div className={`text-3xl font-black font-mono ${auditData.status === "excellent" ? "text-emerald-400" : auditData.status === "warning" ? "text-amber-400" : "text-rose-500"}`}>
                          {auditData.score}%
                        </div>
                        <span className="text-[9px] text-slate-600 uppercase font-mono mt-1">2026 Engine Bound</span>
                      </div>
                      <div className="md:col-span-8 bg-[#070b19]/40 border border-slate-900 p-4 rounded-2xl flex flex-col gap-2">
                        {auditData.checks.map((check, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-left">
                            <span className={`text-xs ${check.passed ? "text-emerald-400" : "text-rose-500"}`}>{check.passed ? "✔" : "✘"}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-300">{check.label}</span>
                              <span className="text-slate-500 text-[10px] mt-0.5 leading-normal">{check.tip}</span>
                            </div>
                          </div>
                        ))}
                        {auditData.warnings.map((warn, idx) => (
                          <div key={idx} className="text-[10px] text-rose-400 flex items-center gap-1 border-t border-slate-900/60 pt-1.5 mt-1 font-mono text-left">
                            <AlertTriangle size={11} className="shrink-0" /> {warn}
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
        <footer className="p-4 md:p-6 bg-[#020617] border-t border-slate-900 shrink-0 z-20">
          <div className="max-w-3xl w-full mx-auto flex flex-col gap-3">
            
            {/* Channel Selection Dock Row */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
                    selectedPlatform === p 
                      ? "bg-slate-900 text-cyan-400 border-slate-700/80 shadow-md" 
                      : "bg-slate-950/40 text-slate-500 border-slate-900 hover:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar Structure */}
            <div className="bg-[#090d1f] border border-slate-800 rounded-2xl p-2 flex flex-col gap-2 relative shadow-lg shadow-black/40">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleExecuteOrchestration(); } }}
                placeholder={`Ask ProJob to synthesize keywords & generate context for ${selectedPlatform}...`}
                className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none p-2 max-h-24 h-12 leading-relaxed text-left"
                style={{ direction: "ltr" }}
              />

              <div className="flex justify-between items-center border-t border-slate-900 pt-2 px-1">
                <div className="flex items-center gap-2">
                  <label className="text-slate-500 hover:text-slate-400 cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg transition-colors">
                    <input type="file" onChange={handleFileChange} className="hidden" />
                    <Paperclip size={14} />
                  </label>
                  {fileName && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/30 border border-cyan-500/20 px-2 py-0.5 rounded-md font-mono">
                      {fileName.slice(0, 14)}...
                    </span>
                  )}
                  <button onClick={() => setShowConfigMenu(!showConfigMenu)} className="text-slate-500 hover:text-slate-400 p-1.5 hover:bg-slate-900 rounded-lg transition-colors">
                    <Sliders size={14} />
                  </button>
                </div>

                <button
                  onClick={handleExecuteOrchestration}
                  disabled={isProcessing || (!inputText.trim() && !fileName)}
                  className="bg-cyan-500 disabled:bg-slate-900 text-slate-950 disabled:text-slate-700 w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-md shadow-cyan-500/10 active:scale-95 shrink-0"
                >
                  <ArrowUp size={14} className={isProcessing ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Expandable Meta Config Drawer Overlay */}
              {showConfigMenu && (
                <div className="absolute bottom-14 left-2 bg-[#090d1f] border border-slate-800 p-3 rounded-xl flex flex-col gap-2.5 shadow-xl z-50 text-left min-w-[200px]">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase font-mono block mb-1">Compute Layer</label>
                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-[11px] p-1.5 rounded text-slate-300 font-mono focus:outline-none">
                      <optgroup label="Frontier Heavweights">{heavyModels.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}</optgroup>
                      <optgroup label="Edge Lightweights">{lightModels.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}</optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase font-mono block mb-1">Horizon Depth</label>
                    <select value={searchDepth} onChange={(e) => setSearchDepth(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-[11px] p-1.5 rounded text-slate-300 font-mono focus:outline-none">
                      <option value="basic">Standard Depth</option>
                      <option value="advanced">Advanced Sync</option>
                      <option value="extreme">Extreme Research 🔒</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-600 font-mono">
              ProJob Engine Context-v3.0. Automated keyword weights sync live with search nodes.
            </div>
          </div>
        </footer>

      </div>

      {/* Strategic Conversion Upsell Modal Grid */}
      <AnimatePresence>
        {showUpsellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
              <button onClick={() => setShowUpsellModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 font-mono text-sm">✕</button>
              <div className="text-center flex flex-col gap-3">
                <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full w-fit mx-auto uppercase tracking-widest font-mono">Performance Cap Reached</span>
                <h3 className="text-lg font-black text-slate-100">Bypass Local Performance Decay</h3>
                <p className="text-slate-400 text-xs leading-relaxed text-left" style={{ direction: "ltr" }}>
                  Your workspace query context threshold has triggered active budget mitigation loops. Unlock deep semantic live web research nodes and continuous highest-fidelity model allocations immediately.
                </p>
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-left my-1 flex flex-col gap-2 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-500"><span>Deep Search Horizons:</span><span class="text-rose-400 font-bold">Throttled (Base)</span></div>
                  <div className="flex justify-between text-slate-500"><span>Synthesis Resolution:</span><span class="text-rose-400 font-bold">Decay Active</span></div>
                  <div className="flex justify-between text-slate-100 border-t border-slate-800 pt-2 mt-1"><span>Unlocked Node Infrastructure:</span><span class="text-emerald-400 font-bold">Google Gemini Pro Core</span></div>
                </div>
                <button onClick={() => { setDecayBypassed(true); setShowUpsellModal(false); setClickCount(0); }} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs p-3 rounded-xl shadow-xl shadow-orange-500/10 active:scale-[0.99] transition-transform">
                  UNLEASH HYPER-ENGINE ($5.00) ⚡
                </button>
                <span className="text-[9px] text-slate-600 block leading-normal">One-click transactional allocation routed via Stripe. Removes local bandwidth execution caps instantly for 30 days.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}