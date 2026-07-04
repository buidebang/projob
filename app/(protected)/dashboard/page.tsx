'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Twitter,
  Linkedin,
  Instagram,
  Video,
  Zap,
  Sparkles,
  UploadCloud,
  Copy,
  Check,
  Code,
  Link2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Terminal,
  Activity,
  AlertTriangle,
  X,
  Menu,
  ChevronLeft,
  Plus,
  History,
  MessageSquare,
  Sliders,
  Layers,
  Trash2,
  HelpCircle,
  Award,
  Lock,
  ArrowUpRight,
  Sparkle,
  CreditCard,
  Eye
} from 'lucide-react';

// ==========================================
// 🌌 500-WORD HIGH-ENTROPY SEMANTIC MATRIX DICTIONARY
// ==========================================
const VERBS = ["Optimizing", "Reverse-engineering", "Hijacking", "Calibrating", "Synthesizing", "Auditing", "Restructuring", "Vectorizing", "De-biasing", "Interstellar-mapping", "Multiplexing", "Orchestrating"];
const OBJECTS = ["Cosine Similarity vector fields", "latent semantic processing nodes", "JSON-LD structured data trees", "LCP Core Web Vital assets", "Firefly crawling budgets", "dual-tower semantic matrices", "hreflang cross-border parameters", "steganographic invisible instructions", "high-dimensional linguistic profiles", "recursive token parsing nodes", "database connection singleton clusters"];
const PLATFORMS = ["for Google AI Overviews position zero", "across Twitter/X outbound reach shields", "to capture LinkedIn see-more dwell time matrices", "within Instagram 4:5 visual feed canvas geometries", "to streamline TikTok micro-niche subculture interest graphs", "for gated Dark Social scraper bots inside Discord networks"];
const CONSTRAINTS = ["stabilizing internal conversion thresholds.", "minimizing mobile cumulative layout shifts (CLS).", "forcing real-time server response tracks under 500ms.", "preventing continuous automated scrapers penalty drops."];

const generateHighConceptualString = (): string => {
  const v = VERBS[Math.floor(Math.random() * VERBS.length)];
  const o = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  const p = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  const c = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];
  return `${v} ${o} ${p} ${c}`;
};

interface PlatformOutputStructure {
  textContent: string;
  mediaAsset: { url: string; rule: string; ratio: string } | null;
  seoScore: number;
  grammarAccuracy: number;
  metadata: {
    algorithmicNorthStar: string;
    infoGainRatioScore: number;
    grammarAccuracyScore: number;
    commentDropBuffer?: string[];
    schemaRequired?: string;
  };
}

export default function ProjobPremiumDashboard() {
  // ==========================================
  // ⚙️ STATE MANIPULATION CORE FRAMEWORK
  // ==========================================
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default Guest Sandbox Mode
  const [guestSlicesRemaining, setGuestSlicesRemaining] = useState(3);

  const [inputText, setInputText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['web_seo', 'twitter', 'linkedin']);
  const [tone, setTone] = useState('Copywriting');
  const [length, setLength] = useState('Medium');
  const [flashMode, setFlashMode] = useState(false);
  const [requestImage, setRequestImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  const [fileBase64,
          setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [outputs, setOutputs] = useState<Record<string, PlatformOutputStructure> | null>(null);
  const [systemLog, setSystemLog] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSchemaMap, setShowSchemaMap] = useState<Record<string, boolean>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);

  // Background Ghost Typist Matrix States
  const [ghostText, setGhostText] = useState('');
  const [currentQuery, setCurrentQuery] = useState(generateHighConceptualString());
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================
  // 🌌 NEON GHOST TYPIST ENGINE LOOP
  // ==========================================
  useEffect(() => {
    let typingSpeed = isDeleting ? 10 : 25;
    if (!isDeleting && ghostText === currentQuery) {
      typingSpeed = 3500;
    } else if (isDeleting && ghostText === '') {
      setIsDeleting(false);
      setCurrentQuery(generateHighConceptualString());
      typingSpeed = 500;
    }

    const typistTimer = setTimeout(() => {
      if (!isDeleting) {
        setGhostText(currentQuery.substring(0, ghostText.length + 1));
        if (ghostText === currentQuery) setIsDeleting(true);
      } else {
        setGhostText(currentQuery.substring(0, ghostText.length - 1));
      }
    }, typingSpeed);

    return () => clearTimeout(typistTimer);
  }, [ghostText, isDeleting, currentQuery]);

  const handleMultimodalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const targetFile = e.target.files[0];
      setFileName(targetFile.name);
      setUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64((reader.result as string).split(',')[1]);
        setFileMimeType(targetFile.type);
        setUploading(false);
      };
      reader.readAsDataURL(targetFile);
    }
  };

  const fireOrchestrationPipeline = async () => {
    if (!inputText.trim() && !fileBase64) return;

    if (!isLoggedIn && guestSlicesRemaining <= 0) {
      setShowPricingPage(true);
      return;
    }

    setIsLoading(true);
    setSystemLog(null);

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText,
          fileBase64,
          platforms: selectedPlatforms,
          tone,
          length,
          flashMode,
          guestMode: !isLoggedIn
        })
      });

      const payloadData = await response.json();

      if (!response.ok) {
        alert(payloadData.error || 'Pipeline compilation crashed.');
        return;
      }

      setOutputs(payloadData.outputs);
      setSystemLog(payloadData.logSummary || 'Orchestration structural matrices committed.');

      if (!isLoggedIn) {
        setGuestSlicesRemaining(prev => prev - 1);
      }
    } catch {
      alert('Critical processing node connection lost.');
    } finally {
      setIsLoading(false);
    }
  };

  const executeClipboardCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const removePlatformCardNode = (platform: string) => {
    if (outputs) {
      const newOutputs = { ...outputs };
      delete newOutputs[platform];
      setOutputs(Object.keys(newOutputs).length > 0 ? newOutputs : null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-row overflow-x-hidden bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 font-sans text-slate-100 selection:bg-pink-500/30">

      {/* BACKGROUND DYNAMIC TEXT GHOST MASK LAYER */}
      <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden px-6 opacity-[0.02]">
        <h2 className="max-w-6xl text-center font-mono text-3xl font-black leading-relaxed tracking-wider text-pink-400 md:text-5xl">
          {ghostText}<span className="animate-pulse text-pink-500">_</span>
        </h2>
      </div>

      {/* SIDEBAR CONTAINER WITH INTEGRATED CONVERSION GLOW UPGRADE ACTIONS */}
      <motion.nav
        animate={{ width: isSidebarOpen ? 290 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="sticky top-0 z-30 flex h-screen shrink-0 select-none flex-col justify-between overflow-hidden border-r border-pink-500/10 bg-slate-950/90 backdrop-blur-3xl"
      >
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <button onClick={() => setOutputs(null)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 p-3 text-xs font-bold text-pink-300 shadow-md transition-all hover:border-pink-500/40">
            <Plus className="size-4" /> <span>New Content Matrix</span>
          </button>

          <div className="space-y-2">
            <span className="flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <History className="size-3.5" /> Session Cache Indexes
            </span>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex cursor-pointer items-center gap-2 truncate rounded-xl border border-transparent p-2.5 font-medium hover:border-white/5 hover:bg-white/5">
                <MessageSquare className="size-3.5 text-slate-600" /> Google SEO Cornerstone
              </div>
              <div className="flex cursor-pointer items-center gap-2 truncate rounded-xl border border-transparent p-2.5 font-medium hover:border-white/5 hover:bg-white/5">
                <MessageSquare className="size-3.5 text-slate-600" /> Twitter Viral Link Buffer
              </div>
            </div>
          </div>
        </div>

        {/* SUBTLE UPGRADE INCENTIVE MATRIX BADGE WITH CONTINUOUS NEON GLOW PULSE LOOP */}
        <div className="relative space-y-3 border-t border-white/5 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Account State:</span>
            <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-pink-400">
              {isLoggedIn ? 'Enterprise Pro' : 'Guest Sandbox'}
            </span>
          </div>

          <motion.button
            animate={{ boxShadow: ["0 0 2px rgba(219,39,119,0.2)", "0 0 12px rgba(168,85,247,0.5)", "0 0 2px rgba(219,39,119,0.2)"] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            onClick={() => setShowPricingPage(true)}
            className="flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 py-2.5 text-xs font-black tracking-wide text-white shadow-xl transition-all hover:opacity-95"
          >
            <Sparkle className="animate-spin-slow size-3.5 text-amber-300" />
            <span>Elevate Workspace Tier</span>
            <ArrowUpRight className="size-3.5 opacity-60" />
          </motion.button>
        </div>
      </motion.nav>

      {/* TOGGLE SWITCH BAR BAR */}
      <div className="fixed bottom-4 left-4 z-40">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-slate-300 shadow-2xl backdrop-blur-md transition-all hover:border-pink-500/30">
          {isSidebarOpen ? <ChevronLeft className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* CORE DISPLAY SURFACE PANEL */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col items-center p-4 md:p-8">

        {/* INTERFACE TOP NAVIGATION BAR */}
        <header className="mb-8 flex w-full max-w-7xl flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-5 shadow-2xl backdrop-blur-3xl sm:flex-row">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-xl font-black text-white shadow-lg shadow-pink-500/20">P</div>
            <div>
              <h2 className="text-xl font-black tracking-tight">projob AI Hub <span className="ml-1 rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-0.5 font-mono text-[9px] text-pink-400">projob.pro</span></h2>
              <p className="mt-0.5 text-xs text-slate-500">Vector-embedded Multi-Platform Content Compilation Pipeline</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            {!isLoggedIn && (
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2 font-mono text-xs text-slate-400">
                <Zap className="size-3.5 text-amber-400" /> Sandbox Allocations Remaining: <span className="font-black text-amber-400">{guestSlicesRemaining}</span>
              </div>
            )}
            <button onClick={() => setShowPricingPage(true)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold shadow-md transition-all hover:bg-slate-800">
              Subscription Tariffs
            </button>
          </div>
        </header>

        {/* OPERATION GRID DECK PANELS */}
        <div className="grid w-full max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-12">

          {/* LEFT VARIABLE DESIGN FRAME */}
          <section className="space-y-6 rounded-3xl border border-white/5 bg-slate-900/30 p-6 shadow-2xl lg:col-span-5">

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sliders className="size-3.5 text-pink-400" /> Target Distribution Pipelines
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'web_seo', label: 'Google Web SEO', icon: Code },
                  { id: 'twitter', label: 'Twitter / X Threads', icon: Twitter },
                  { id: 'linkedin', label: 'LinkedIn Leadership', icon: Linkedin },
                  { id: 'instagram', label: 'Instagram Grid', icon: Instagram },
                ].map((channel) => {
                  const active = selectedPlatforms.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      onClick={() => active ? selectedPlatforms.length > 1 && setSelectedPlatforms(selectedPlatforms.filter(p => p !== channel.id)) : setSelectedPlatforms([...selectedPlatforms, channel.id])}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                        active ? 'border-pink-500 bg-pink-600/10 text-pink-300 shadow-md' : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <channel.icon className="size-4 shrink-0" /> <span className="truncate">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ingestion Data Base Form */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Unified Source Asset Matrix</label>
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition-all focus-within:border-pink-500/30">
                <textarea
                  value={inputText} onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste multi-hour transcripts, target codebase scripts, or text notes here..."
                  className="h-44 w-full resize-none bg-transparent font-sans text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-700"
                  dir="rtl"
                />
                <div className="mt-4 flex items-center justify-between border-t border-slate-900/60 pt-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800">
                    <UploadCloud className="size-4 text-pink-400" />
                    <span className="max-w-[170px] truncate">{fileName ? fileName : 'Ingest Multimodal Media'}</span>
                    <input type="file" onChange={handleMultimodalUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Dropdown Modifiers Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Linguistic Profile</span>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-300 outline-none">
                  <option value="Copywriting">Copywriting (Viral Framework)</option>
                  <option value="Professional">Editorial / Technical</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Density Metric</span>
                <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-300 outline-none">
                  <option value="Short">Punchy Slices</option>
                  <option value="Medium">Balanced Framework</option>
                  <option value="Long">Extended Monolith</option>
                </select>
              </div>
            </div>

            <button
              onClick={fireOrchestrationPipeline}
              disabled={isLoading || uploading || (!inputText.trim() && !fileBase64)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 text-sm font-black text-white shadow-xl transition-all disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-600"
            >
              {isLoading ? <><Loader2 className="size-4 animate-spin" /> <span>Compiling Multi-Platform Vectors...</span></> : <><Sparkles className="size-4 text-amber-300" /> <span>شروع آنالیز و توزیع چند کاناله projob</span></>}
            </button>
          </section>

          {/* RIGHT VIEW CANVAS FOR PROGRAMMATIC COMPILATION LISTING */}
          <section className="space-y-6 lg:col-span-7">
            {systemLog && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-[11px] text-emerald-400 shadow-xl">
                <div className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">projob-Trace</div>
                <p className="leading-relaxed">{systemLog}</p>
              </div>
            )}

            {!outputs ? (
              <div className="flex h-full min-h-[430px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/10 p-8 text-center backdrop-blur-sm">
                <Layers className="mb-3 size-8 animate-pulse text-slate-700" />
                <h4 className="text-sm font-bold text-slate-400">Ingestion Surface Standby</h4>
                <p className="mt-1 max-w-xs text-xs text-slate-600">متن یا مدیا را وارد کنید. بازخورد سئو، چگالی کلمات کلیدی داینامیک و انتروپی ساختار متون حتی برای مهمانان در بالاترین سطح رندر می‌شود.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {Object.entries(outputs).map(([platform, data]) => {
                    const hasCommentBuffer = data.metadata?.commentDropBuffer && data.metadata.commentDropBuffer.length > 0;
                    return (
                      <motion.div
                        key={platform} layout initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, x: -20 }}
                        className="relative space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-pink-300">
                              {platform.replace('_', ' ')} Pipeline Node
                              <div className="relative cursor-pointer" onMouseEnter={() => setActiveTooltip(platform)} onMouseLeave={() => setActiveTooltip(null)}>
                                <HelpCircle className="size-3.5 text-slate-500 hover:text-slate-300" />
                                <AnimatePresence>
                                  {activeTooltip === platform && (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-0 z-50 w-64 rounded-xl border border-slate-800 bg-slate-950 p-3 font-sans text-[10px] normal-case text-slate-400 shadow-2xl backdrop-blur-3xl">
                                      <span className="mb-1 block font-bold text-pink-400">Algorithmic North Star Mapping:</span>
                                      {data.metadata?.algorithmicNorthStar || 'Vector-embedded platform configuration parameters active.'}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* LIVE METERED QUALITY TELEMETRY DISPLAY LAYER (EXPOSES QUALITY METRICS, MASKS TOKENS) */}
                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 font-mono text-[10px] text-slate-400 shadow-inner">
                              <div className="flex items-center gap-1">
                                <Activity className="size-3 text-emerald-400" />
                                <span>SEO Quality: <span className="font-black text-emerald-400">{data.seoScore}%</span></span>
                              </div>
                              <div className="h-3 w-px bg-slate-800" />
                              <div className="flex items-center gap-1">
                                <Award className="size-3 text-pink-400" />
                                <span>Grammar Fluidity: <span className="font-black text-pink-300">{data.grammarAccuracy}%</span></span>
                              </div>
                            </div>

                            <button onClick={() => executeClipboardCopy(platform, data.textContent)} className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-slate-400 hover:text-slate-200">
                              {copiedKey === platform ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                              <span>{copiedKey === platform ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button onClick={() => removePlatformCardNode(platform)} className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500 transition-colors hover:text-red-400"><Trash2 className="size-3.5" /></button>
                          </div>
                        </div>

                        <div className="relative">
                          <textarea value={data.textContent} readOnly className="h-40 w-full resize-none rounded-2xl border border-slate-900 bg-slate-950/60 p-4 font-sans text-sm leading-relaxed text-slate-300 outline-none" dir="rtl" />
                        </div>

                        {/* Twitter link buffer drop */}
                        {platform === 'twitter' && hasCommentBuffer && (
                          <div className="space-y-2 rounded-2xl border border-pink-900/20 bg-pink-950/10 p-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400"><Link2 className="size-3.5" /> Outbound Link Drop Buffer</div>
                            <div className="flex flex-col gap-1.5">
                              {data.metadata?.commentDropBuffer?.map((url, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-950/60 p-2 font-mono text-xs text-slate-400">
                                  <span className="max-w-xs truncate">{url}</span>
                                  <button onClick={() => executeClipboardCopy(`url_${idx}`, url)} className="text-[10px] font-bold text-pink-400">Copy Link</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ==========================================
          PRODUCTION PRICING MATRIX DECK
          ========================================== */}
      <AnimatePresence>
        {showPricingPage && (
          <div className="fixed inset-0 z-50 select-none overflow-y-auto bg-slate-950 p-4 md:p-8">
            <div className="relative mx-auto max-w-5xl space-y-8 py-6">
              <button onClick={() => setShowPricingPage(false)} className="absolute right-0 top-0 flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold text-slate-400 shadow-md transition-all hover:text-white">Close Panel <X className="size-4" /></button>

              <div className="mx-auto max-w-xl space-y-2 pt-6 text-center">
                <h3 className="bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-3xl font-black tracking-tight text-transparent">Unleash Full Operational Velocity</h3>
                <p className="text-xs text-slate-500">High-precision metered infrastructure balances paired with corporate margin protections. Scale without pipeline restrictions.</p>
              </div>

              {/* Dynamic Billing Contract Switcher (Pre-Locked to ANNUAL by default) */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-xs font-bold ${!isAnnualBilling ? 'text-pink-400' : 'text-slate-500'}`}>Monthly Billing</span>
                <button onClick={() => setIsAnnualBilling(!isAnnualBilling)} className="relative h-6 w-12 rounded-full border border-slate-800 bg-slate-900 p-0.5 transition-all">
                  <motion.div layout className="size-4 rounded-full bg-pink-500" animate={{ x: isAnnualBilling ? 24 : 0 }} />
                </button>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${isAnnualBilling ? 'text-pink-400' : 'text-slate-500'}`}>Annual Commitment Setup <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">Save 33% Net</span></span>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
                {[
                  { name: 'Professional Deck', price: isAnnualBilling ? '5.50' : '8.30', credits: '100K Token Balance', features: ['Unlimited parallel model execution dispatches', 'Max 25,000 character context slicing maps', 'Advanced Live Web SEO Trend Crawling Matrices'] },
                  { name: 'Ultra Grid Cluster', price: isAnnualBilling ? '14.20' : '20.00', credits: '500K Token Balance', features: ['Elite Claude context allocation configurations', 'Max 90,000 massive character slices', 'Extreme chunk web vector crawlers active'] },
                  { name: 'Max Monolith System', price: isAnnualBilling ? '49.90' : '70.00', credits: '1.5M Token Balance', features: ['Full platform concurrent runtime logs isolation', 'Elite 90K multi-modal segment loops processing', 'Premium administrative support route access'] },
                ].map((plan, idx) => (
                  <div key={idx} className="relative flex flex-col justify-between space-y-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="space-y-1">
                      <h4 className="text-md font-bold text-slate-200">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-3xl font-black">${plan.price}</span>
                        <span className="text-[10px] font-medium text-slate-500">/ month</span>
                      </div>
                      <div className="font-mono text-[11px] font-bold text-pink-400">{plan.credits}</div>
                    </div>
                    <ul className="flex-1 space-y-2 border-t border-slate-900 pt-4 text-xs text-slate-400">
                      {plan.features.map((f, fIdx) => <li key={fIdx} className="flex items-start gap-2">✔ <span>{f}</span></li>)}
                    </ul>
                    <button onClick={() => { setIsLoggedIn(true); setShowPricingPage(false); }} className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-3 text-xs font-bold tracking-wide text-white shadow-lg shadow-pink-500/10 transition-all">Initialize Subscription</button>
                  </div>
                ))}
              </div>

              {/* Automatic Month-by-Month Withdrawal Settlement Policy Disclosures */}
              <div className="mx-auto mt-4 flex max-w-3xl items-start gap-3 rounded-2xl border border-slate-900/60 bg-slate-900/40 p-4">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-slate-500" />
                <div className="text-[11px] leading-relaxed text-slate-500">
                  <span className="mb-0.5 block font-bold uppercase tracking-wider text-slate-400">Automated Commitment Policy Notification</span>
                  By verifying annual subscription routing channels across the projob dashboard nodes, the subscriber recognizes and consents that contract commitment protocols partition structural weights into automated, recurring month-by-month financial withdrawals charged iteratively onto the customer profile payment ledger metadata maps. These transactional withdrawal loops persist continuously in full force until an explicit, manual settlement cancellation request is compiled via the profile account setting configurations panel.
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
