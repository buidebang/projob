import * as crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

import { prisma, getSystemConfig } from "@/lib/db";
import { KeywordOptimizer } from "@/lib/keyword-optimizer";
import { ProcessingOrchestrator } from "@/lib/processing-orchestrator";
import {
  applyPromptInjectionPenalty,
  checkSemanticCache,
  evaluateUsageAndGetModel,
  sanitizeAndCompressInput,
} from "@/lib/rate-limiter";
import { LocalSEOValidator } from "@/lib/seo-validator";

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
    const config = await getSystemConfig();
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

    if (!config.global_ai_generation_enabled) {
      return NextResponse.json(
        { error: "Global AI Generation is temporarily offline for maintenance." },
        { status: 503 },
      );
    }

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
        if (current > config.guest_upload_limit + 3)
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



    let searchDepth: "none" | "basic" | "advanced" | "extreme" = "basic";
    let maxSearchResults = 0;
    let targetModel = config.active_ai_provider === 'OPENROUTER' ? (config.openrouter_model_name || "google/gemini-3.5-flash") : (config.direct_model_name || "gemini-1.5-flash");
    let targetEnum: AIModelType = AIModelType.GEMINI_35_FLASH;

    let isThrottled = false;
    let throttleReason = "";

    if (user) {
      const routingStrategy = await evaluateUsageAndGetModel(user.id);
      if (!routingStrategy.isAllowed && !routingStrategy.isThrottled) {
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
      isThrottled = routingStrategy.isThrottled;
      throttleReason = routingStrategy.reason || "Weekly optimal quota reached. Operating in standard efficiency mode. Upgrade for deep capabilities.";
    } else {
      searchDepth = "basic";
      maxSearchResults = 0;
    }

    if (searchDepth !== "basic" && (searchDepth as string) !== "none" && !isThrottled) {
      const currentTier = user?.tier || "FREE";
      if (!config.deep_search_allowed_tiers.includes(currentTier)) {
        searchDepth = "basic";
        maxSearchResults = Math.min(maxSearchResults, 2);
      }
    }

    if (!config.deep_search_enabled) {
      searchDepth = "basic";
      maxSearchResults = 0;
    }



    let effectiveLength = length;
    if (isThrottled && config.soft_throttle_reduction_percent) {
        effectiveLength = `length_reduced_by_${config.soft_throttle_reduction_percent}_percent`;
    }

    if (flashMode) {
      targetModel = config.active_ai_provider === 'OPENROUTER' ? (config.openrouter_model_name || "google/gemini-3.5-flash") : (config.direct_model_name || "gemini-1.5-flash");
      targetEnum = AIModelType.GEMINI_35_FLASH;
    } else if (
      hasFile &&
      fileMimeType &&
      (fileMimeType.startsWith("video/") || fileMimeType.startsWith("audio/"))
    ) {
      targetEnum = AIModelType.GEMINI_31_PRO;
    }

    const optimizationReport = KeywordOptimizer.processAutonomousKeywords(
      cleanText,
      platforms,
    );

    const requestedChannels = body.platforms;
    let allowedChannelsCount = 1;

    if (user?.tier === SubscriptionTier.PRO) allowedChannelsCount = 2;
    if (
      user?.tier === SubscriptionTier.MAX ||
      user?.tier === SubscriptionTier.ULTRA
    )
      allowedChannelsCount = requestedChannels.length;
    if (user?.decayBypassed) allowedChannelsCount = requestedChannels.length;

    const executableChannels = requestedChannels.slice(0, allowedChannelsCount);

    let capacityMultiplier = 1;
    if (user && user.capacityMultiplier) {
      capacityMultiplier = user.capacityMultiplier;
    }

    if (!isThrottled) {
        effectiveLength = length === "medium" && capacityMultiplier > 1 ? "long" : length;
    }

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
        length: effectiveLength,
        flashMode,
        searchDepth: searchDepth,
        maxSearchResults: maxSearchResults,
        imageRequest,
      },
      modelResolutionAdapter[targetModel] || targetModel,
    );

    const finalizedJsonOutputs: Record<string, any> = {};

    Object.entries(orchestratorResult.finalOutputs).forEach(
      ([plat, data]: [string, any]) => {
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
      const remainingTokens = await deductCreditsDynamic(
        user.id,
        nativeOpenRouterMetrics.prompt_tokens,
        nativeOpenRouterMetrics.completion_tokens,
        targetEnum,
        user.tier,
      );

      await prisma.$transaction([
        prisma.usageLog.create({
          data: {
            userId: user.id,
            inputTokens: nativeOpenRouterMetrics.prompt_tokens,
            outputTokens: nativeOpenRouterMetrics.completion_tokens,
            creditsDeducted: 0,
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
      isThrottled,
      throttleReason,
      logSummary: orchestratorResult.aggregatedLog,
    });
  } catch (error: any) {
    console.error("[projob Core Gateway Fatal Crash]:", error);

    // Agentic UI Awareness Intercept
    try {
      if (error.message.includes("TRIGGER_UPSELL")) {
        const payload = JSON.parse(error.message);
        if (payload.action === "TRIGGER_UPSELL") {
          return NextResponse.json(payload, { status: 413 });
        }
      }
    } catch (e) {
    }
    return NextResponse.json(
      { error: "Gateway repurposing failure.", details: error.message },
      { status: 500 },
    );
  }
}
