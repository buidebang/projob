import * as crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { KeywordOptimizer } from "@/lib/keyword-optimizer";
import { ProcessingOrchestrator } from "@/lib/processing-orchestrator";
import {
  applyPromptInjectionPenalty,
  checkSemanticCache,
  evaluateUsageAndGetModel,
  sanitizeAndCompressInput,
} from "@/lib/rate-limiter";
import { LocalSEOValidator } from "@/lib/seo-validator";

// تعاریف محلی بدون کلمه کلیدی export جهت بای‌پاس ۱۰۰٪ اعتبارسنجی Next.js Route
const AIModelType = {
  GEMINI_35_FLASH: "GEMINI_35_FLASH",
  GEMINI_31_PRO: "GEMINI_31_PRO",
} as any;
type AIModelType = any;

const SubscriptionTier = {
  FREE: "FREE",
} as any;
type SubscriptionTier = any;
const modelResolutionAdapter: { [key: string]: string } = {
  "Claude Fable 5": "gemini-1.5-pro",
  "Claude Opus 4.8": "gemini-1.5-pro",
  "GPT-5.5 Pro": "gemini-1.5-pro",
  "GPT-5.5": "gemini-1.5-pro",
  "Gemini 3.1 Pro": "gemini-1.5-pro",
  "Qwen3.7-Max": "gemini-1.5-pro",
  "Grok 4.3": "gemini-1.5-pro",
  "DeepSeek V4 Pro": "gemini-1.5-pro",
  "Gemini 3.5 Flash": "gemini-1.5-flash",
  "Nano Banana 2": "gemini-1.5-flash",
  "GPT-5 mini": "gemini-1.5-flash",
  "Llama 4 Scout": "gemini-1.5-flash",
  "Mistral Nemo": "gemini-1.5-flash",
  "DeepSeek V4 Flash": "gemini-1.5-flash",
  "Kimi K2.6": "gemini-1.5-flash",
  "Mistral Small 3": "gemini-1.5-flash",
  "Gemma 3 12B": "gemini-1.5-flash",
  "Qwen3.5-9B": "gemini-1.5-flash",
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const {
      inputText,
      fileBase64,
      fileMimeType,
      platforms,
      tone,
      length,
      flashMode,
      guestMode,
      imageRequest,
    } = body;

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const hasText = !!inputText && inputText.trim() !== "";
    const hasFile = !!fileBase64 && !!fileMimeType;

    if (!hasText && !hasFile) {
      return NextResponse.json(
        { error: "Payload empty. Context missing." },
        { status: 400 },
      );
    }

    let activeUserTier = SubscriptionTier.FREE;
    let userId = "GUEST_SANDBOX_NODE";

    if (guestMode) {
      const redis = require("@/lib/db").redis;
      if (redis) {
        const key = `guest_limit_${ip}`;
        const current = await redis.incr(key);
        if (current === 1) await redis.expire(key, 86400);
        if (current > 3)
          return NextResponse.json(
            { error: "Guest limit exceeded" },
            { status: 429 },
          );
      }
    }

    let user: any = null;

    if (!guestMode && session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        activeUserTier = user.tier;
        userId = user.id;
      }
    }

    let cleanText = "";
    if (hasText) {
      const sanitation = sanitizeAndCompressInput(inputText);
      if (sanitation.penaltyApplied && user) {
        const remainingCredits = await applyPromptInjectionPenalty(user.id);
        return NextResponse.json(
          {
            error: "Security execution block. Penalty issued.",
            creditsLeft: remainingCredits,
          },
          { status: 403 },
        );
      }
      cleanText = sanitation.sanitizedText;
    }

    const lookupFingerprint = crypto
      .createHash("sha256")
      .update(
        `${cleanText}_${fileBase64?.substring(0, 400) || "no_file"}_${platforms.join(",")}_${flashMode}`,
      )
      .digest("hex");

    if (!hasFile) {
      const cachedResponse = await checkSemanticCache(cleanText);
      if (cachedResponse) {
        return NextResponse.json({
          outputs: cachedResponse,
          executionMode: "SEMANTIC_CACHE_INTEGRATED",
          isCached: true,
        });
      }
    }

    // استخراج استراتژی پویای حسابرسی و مدیریت عمق وب‌سرچ
    let searchDepth: "none" | "basic" | "advanced" | "extreme" = "basic";
    let maxSearchResults = 0;
    let targetModel = "google/gemini-3.5-flash";
    let targetEnum: AIModelType = AIModelType.GEMINI_35_FLASH;

    if (user) {
      const routingStrategy = await evaluateUsageAndGetModel(user.id);
      if (!routingStrategy.isAllowed) {
        return NextResponse.json(
          {
            error:
              routingStrategy.reason || "SaaS Tier execution budget exhausted.",
          },
          { status: 402 },
        );
      }
      targetModel = routingStrategy.modelName;
      targetEnum = routingStrategy.modelEnum;
      searchDepth = routingStrategy.searchDepth;
      maxSearchResults = routingStrategy.maxSearchResults;
    } else {
      targetModel = "google/gemini-3.5-flash";
      targetEnum = AIModelType.GEMINI_35_FLASH;
      searchDepth = "basic";
      maxSearchResults = 0;
    }

    if (flashMode) {
      targetModel = "google/gemini-3.5-flash";
      targetEnum = AIModelType.GEMINI_35_FLASH;
    } else if (
      hasFile &&
      fileMimeType &&
      (fileMimeType.startsWith("video/") || fileMimeType.startsWith("audio/"))
    ) {
      targetModel = "google/gemini-3.1-pro-preview";
      targetEnum = AIModelType.GEMINI_31_PRO;
    }

    // ۲. فعال‌سازی موتور بهینه‌سازی کلمات کلیدی خودکار در لایه پنهان
    const optimizationReport = KeywordOptimizer.processAutonomousKeywords(
      cleanText,
      platforms,
    );

    // ۳. Slice execution channels cleanly based on tier allowances
    const requestedChannels = body.platforms;
    let allowedChannelsCount = 1;

    if (user?.tier === SubscriptionTier.PRO) allowedChannelsCount = 2;
    if (
      user?.tier === SubscriptionTier.MAX ||
      user?.tier === SubscriptionTier.ULTRA
    )
      allowedChannelsCount = requestedChannels.length;
    if (user?.decayBypassed) allowedChannelsCount = requestedChannels.length; // From $5 micro-upsell

    const executableChannels = requestedChannels.slice(0, allowedChannelsCount);

    // ۳. ارسال کانتکست سئوشده به ابرارکستریتور سیستم

    let capacityMultiplier = 1;
    if (user && user.capacityMultiplier) {
      capacityMultiplier = user.capacityMultiplier;
    }

    // Evaluate if we should boost length based on multiplier
    const effectiveLength =
      length === "medium" && capacityMultiplier > 1 ? "long" : length;

    const orchestratorResult = await ProcessingOrchestrator.orchestrate(
      {
        capacityMultiplier,

        userId: userId,
        tier: activeUserTier,
        inputText: optimizationReport.optimizedText,
        fileBase64,
        fileMimeType,
        platforms: executableChannels,
        tone,
        length,
        flashMode,
        searchDepth: searchDepth,
        maxSearchResults: maxSearchResults,
        imageRequest,
      },
      modelResolutionAdapter[targetModel] || targetModel,
    );

    // ۴. سنجش و ارزیابی کیفیت خروجی به صورت محلی و تزریق درصدها به پاسخ فرانت‌اند
    const finalizedJsonOutputs: Record<string, any> = {};

    Object.entries(orchestratorResult.finalOutputs).forEach(
      ([plat, data]: [string, any]) => {
        // اجرای الگوریتم سنجش کیفیت محلی بر پایه متدولوژی‌های استخراج شده
        const qualityMetrics = LocalSEOValidator.evaluatePayloadQuality(
          data.textContent,
          plat,
        );

        finalizedJsonOutputs[plat] = {
          textContent: data.textContent,
          mediaAsset: data.mediaAsset,
          seoScore: qualityMetrics.metadata.infoGainRatioScore,
          grammarAccuracy: qualityMetrics.grammarAccuracy,
          metadata: data.metadata,
        };
      },
    );

    if (user) {
      const actualPromptTokens = orchestratorResult.totalInputTokens || 1000;
      const actualCompletionTokens =
        orchestratorResult.totalOutputTokens || 1500;

      const nativeOpenRouterMetrics = {
        prompt_tokens: actualPromptTokens,
        completion_tokens: actualCompletionTokens,
      };
      const { deductCreditsDynamic } = await import("@/lib/rate-limiter");
      const remainingUserCredits = await deductCreditsDynamic(
        user.id,
        nativeOpenRouterMetrics.prompt_tokens,
        nativeOpenRouterMetrics.completion_tokens,
        targetEnum,
        user.tier,
      );

      const creditsDeductedValue =
        (user.credits as any).toNumber() - remainingUserCredits;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          // 👇 حل قطعی مشکل اعشار با پاس دادن مستقیم عدد و بای‌پاس تایپ‌اسکریپت
          data: { credits: remainingUserCredits as any },
        }),
        prisma.usageLog.create({
          data: {
            userId: user.id,
            inputTokens: nativeOpenRouterMetrics.prompt_tokens,
            outputTokens: nativeOpenRouterMetrics.completion_tokens,
            creditsDeducted:
              creditsDeductedValue > 0 ? creditsDeductedValue : 0.01,
            modelUsed: targetEnum,
            promptHash: lookupFingerprint,
          },
        }),
      ]);
    }

    return NextResponse.json({
      outputs: finalizedJsonOutputs,
      executionMode: targetModel,
      isCached: false,
      logSummary: orchestratorResult.aggregatedLog,
    });
  } catch (error: any) {
    console.error("[projob Core Gateway Fatal Crash]:", error);
    return NextResponse.json(
      { error: "Gateway repurposing failure.", details: error.message },
      { status: 500 },
    );
  }
}
