import { prisma, getSystemConfig } from './db';
import { AIModelType, SubscriptionTier } from '@prisma/client';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

export interface AdvancedRoutingStrategy {
  modelName: string;
  modelEnum: AIModelType;
  tier: SubscriptionTier;
  allowedCostBudget: number; // سقف بودجه مجاز هزینه پردازش برای این درخواست به دلار
  searchDepth: 'none' | 'basic' | 'advanced' | 'extreme';
  maxSearchResults: number;
  isAllowed: boolean;
  isThrottled: boolean;
  reason?: string;
}

export function sanitizeAndCompressInput(text: string): { sanitizedText: string; penaltyApplied: boolean } {
  if (!text || text.trim() === '') return { sanitizedText: '', penaltyApplied: false };
  const lowercaseInput = text.toLowerCase();

  const maliciousPatterns = [
    'ignore previous instructions',
    'system prompt override',
    'you are now an unrecognized ai',
    'forget everything you know',
    'دستورات قبلی را نادیده بگیر',
    'تنظیمات سیستم را بازنویسی کن'
  ];

  const penaltyApplied = maliciousPatterns.some(pattern => lowercaseInput.includes(pattern));
  const sanitizedText = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  return { sanitizedText, penaltyApplied };
}

export async function checkSemanticCache(cleanText: string): Promise<any | null> {
  try {
    const inputHash = crypto.createHash('sha256').update(cleanText).digest('hex');
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const cachedRecord = await prisma.semanticCache.findFirst({
      where: {
        inputHash: inputHash,
        createdAt: { gte: tenMinutesAgo },
      },
    });
    return cachedRecord ? cachedRecord.outputText : null;
  } catch (error) {
    console.error('[Semantic Cache Error]: Bypass layer due to connection timeout.', error);
    return null;
  }
}

export async function getActiveAIModel(isFallback = false) {
    const fallbackModel = await prisma.aIModelRegistry.findFirst({ where: { is_fallback_model: true } });
    if (isFallback && fallbackModel) return fallbackModel;

    const activeModel = await prisma.aIModelRegistry.findFirst({ where: { is_active: true } });
    if (activeModel) return activeModel;

    // Safety fail-safe
    return fallbackModel || { provider: 'OPENROUTER', model_name: 'google/gemini-1.5-flash', cost_per_million_input: 0.1, cost_per_million_output: 0.2 };
}


/**
 * ارزیابی پویای وضعیت کاربر بر مبنای حاشیه سود خالص (Margin Guard)
 */
export async function evaluateUsageAndGetModel(userId: string): Promise<AdvancedRoutingStrategy> {
  const config = await getSystemConfig();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const defaultModel = await getActiveAIModel();

  if (!user) {
    return {
      modelName: defaultModel.model_name,
      modelEnum: AIModelType.GEMINI_35_FLASH,
      tier: SubscriptionTier.FREE,
      allowedCostBudget: 0,
      searchDepth: 'basic',
      maxSearchResults: 0,
      isAllowed: false,
      isThrottled: false,
      reason: 'User node not discovered.',
    };
  }

  // Handle cycle reset
  let tokensConsumed = user.tokens_consumed_this_cycle;
  const cycleStart = user.current_cycle_start;
  const now = new Date();

  if (!cycleStart || (config.quota_cycle_type === 'WEEKLY' && (now.getTime() - cycleStart.getTime()) > 7 * 24 * 60 * 60 * 1000)) {
     await prisma.user.update({
         where: { id: user.id },
         data: { current_cycle_start: now, tokens_consumed_this_cycle: 0, is_throttled: false }
     });
     tokensConsumed = 0;
  }

  // Refactored Exhaustion Logic: Rely strictly on Abstract Credits
  const isThrottled = user.credits.toNumber() <= 0;

  if (isThrottled && !user.is_throttled) {
       await prisma.user.update({
         where: { id: user.id },
         data: { is_throttled: true }
     });
  }

  const activeModelRecord = await getActiveAIModel(isThrottled);

  // ۱. پلن رایگان (FREE):
  if (user.tier === SubscriptionTier.FREE) {
    if (isThrottled) {
      return {
        modelName: activeModelRecord.model_name,
        modelEnum: AIModelType.GEMINI_35_FLASH,
        tier: SubscriptionTier.FREE,
        allowedCostBudget: 0.0001,
        searchDepth: 'none',
        maxSearchResults: 0,
        isAllowed: false,
        isThrottled: true,
        reason: 'Free optimal quota reached.',
      };
    }
    return {
      modelName: activeModelRecord.model_name,
      modelEnum: AIModelType.GEMINI_35_FLASH,
      tier: SubscriptionTier.FREE,
      allowedCostBudget: 0.005,
      searchDepth: 'basic',
      maxSearchResults: 2,
      isAllowed: true,
      isThrottled: false,
    };
  }

  // Premium Tiers
  let searchDepth: "none" | "basic" | "advanced" | "extreme" = isThrottled ? 'none' : 'advanced';
  let maxSearchResults = isThrottled ? 0 : 5;

  // Downgrade search depth if credits are running extremely low (less than 100)
  if (!isThrottled && user.credits.toNumber() < 100) {
      searchDepth = 'basic';
      maxSearchResults = 2;
  }

  return {
        modelName: activeModelRecord.model_name,
        modelEnum: AIModelType.GEMINI_31_PRO,
        tier: user.tier,
        allowedCostBudget: 0.05,
        searchDepth: searchDepth,
        maxSearchResults: maxSearchResults,
        isAllowed: true,
        isThrottled: isThrottled,
  };
}

export async function deductCreditsDynamic(
  userId: string,
  inputTokens: number,
  outputTokens: number,
  modelEnum: AIModelType,
  tier: SubscriptionTier,
  searchDepth: string = 'none'
): Promise<number> {
  const config = await getSystemConfig();

  let deductionCost = 0;

  if (modelEnum === AIModelType.GEMINI_35_FLASH) {
      deductionCost += config.cost_light_model;
  } else if (modelEnum === AIModelType.GEMINI_31_PRO) {
      deductionCost += config.cost_heavy_model;
  } else {
      deductionCost += config.cost_medium_model;
  }

  if (searchDepth !== 'none' && searchDepth !== 'basic') {
      deductionCost += config.cost_deep_search;
  }

  // ATOMIC DECREMENT: Safely update user credits without race conditions
  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      credits: { gte: deductionCost }
    },
    data: {
      credits: { decrement: deductionCost },
      tokens_consumed_this_cycle: { increment: deductionCost },
    }
  });

  if (result.count === 0) {
    // Fallback: If they didn't have enough credits, atomically set credits to 0 and throttle them
    const fallback = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: 0,
        is_throttled: true
      },
      select: { credits: true }
    });
    return fallback.credits.toNumber();
  }

  // Get the new credits value to return
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  return user?.credits.toNumber() || 0;
}

export async function applyPromptInjectionPenalty(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const updatedCredits = Math.max(0, user.credits.toNumber() - 500);
  await prisma.user.update({ where: { id: userId }, data: { credits: new Prisma.Decimal(updatedCredits.toFixed(4)) } });
  return updatedCredits;
}
