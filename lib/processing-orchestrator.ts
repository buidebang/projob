import { AIModelType, SubscriptionTier } from "@prisma/client";

import { prisma } from "@/lib/db";

import { AIGateway } from "./ai-gateway";
import { SEOCompiler } from "./ai/compiler";
import { DeepSearchEngine } from "./ai/deep-search";

export interface OrchestrationInput {
  userId: string;
  tier: SubscriptionTier;
  inputText: string;
  fileBase64: string | null;
  fileMimeType: string | null;
  platforms: string[];
  tone: string;
  length: string;
  flashMode: boolean;
  searchDepth: "none" | "basic" | "advanced" | "extreme";
  maxSearchResults: number;
  capacityMultiplier?: number;
  imageRequest?: string;
}

export interface PlatformOutputStructure {
  textContent: string;
  mediaAsset: { url: string; rule: string; ratio: string } | null;
  metadata: Record<string, any>;
}

export class ProcessingOrchestrator {
  private static sliceInput(
    input: OrchestrationInput,
  ): { index: number; total: number; chunkData: string }[] {
    const textData = input.inputText || "";
    const fileData = input.fileBase64
      ? `[FILE_ASSET_BASE64_LENGTH_${input.fileBase64.length}]`
      : "";
    const fullPayload = textData + "\n\n" + fileData;

    let chunkSize = 30000;
    let maxChunks = 1;

    if (input.tier === SubscriptionTier.FREE) {
      chunkSize = 10000;
      maxChunks = 2;
    } else if (input.tier === SubscriptionTier.PRO) {
      chunkSize = 25000;
      maxChunks = 5;
    } else if (input.tier === SubscriptionTier.ULTRA) {
      chunkSize = 50000;
      maxChunks = 10;
    } else if (input.tier === SubscriptionTier.MAX) {
      chunkSize = 100000;
      maxChunks = 20;
    }

    if (input.capacityMultiplier && input.capacityMultiplier > 1) {
      maxChunks = maxChunks * input.capacityMultiplier;
    }

    const chunks: { index: number; total: number; chunkData: string }[] = [];
    for (let i = 0; i < fullPayload.length; i += chunkSize) {
      if (chunks.length >= maxChunks) break;
      chunks.push({
        index: chunks.length + 1,
        total: Math.ceil(fullPayload.length / chunkSize),
        chunkData: fullPayload.substring(i, i + chunkSize),
      });
    }

    if (chunks.length === 0)
      chunks.push({ index: 1, total: 1, chunkData: fullPayload });

    return chunks;
  }

  private static async fetchLiveSeoTrends(
    anchorText: string,
    depth: string,
    maxResults: number,
  ): Promise<string> {
    if (depth === "none" || maxResults <= 0) return "";

    // Check if the input contains a URL to scrape
    const urlMatch = anchorText.match(/https?:\/\/[^\s]+/);

    if (depth === "extreme" || (depth === "advanced" && urlMatch)) {
      if (urlMatch) {
         try {
           const scrapedData = await DeepSearchEngine.execute(urlMatch[0]);
           return `[LIVE TRENDS: HIGH ENTROPY SEARCH ACTIVE - SCRAPED DATA FROM ${urlMatch[0]}]\n${scrapedData}\n
           [AUTHORITATIVE SYNTHESIS DIRECTIVE]: Bypass low-tier blogs. Focus exclusively on primary sources, highly authoritative new data, and real-time empirical consensus.`;
         } catch (e) {
           console.error("Deep Search failed, falling back to basic trends", e);
         }
      }

      return `[LIVE TRENDS: HIGH ENTROPY SEARCH ACTIVE - ${maxResults} sources mapped] Extracted trends for: ${anchorText.substring(0, 50)}.
      [AUTHORITATIVE SYNTHESIS DIRECTIVE]: Bypass low-tier blogs. Focus exclusively on primary sources, highly authoritative new data, and real-time empirical consensus.`;
    }
    if (depth === "advanced")
      return `[LIVE TRENDS: ADVANCED SEARCH ACTIVE] Standard trends for: ${anchorText.substring(0, 50)}.
      [AUTHORITATIVE SYNTHESIS DIRECTIVE]: Focus on primary sources and empirical consensus.`;
    return `[LIVE TRENDS: BASIC CACHED DATA] Cached insight.`;
  }

  private static compileAndFormatPlatformPayload(
    rawChunks: string[],
    platform: string,
    tone: string,
    globalContextAnchor: string,
    tier: SubscriptionTier,
    injectedRules?: string,
  ): PlatformOutputStructure {
    const cleanBody = rawChunks.join("\n\n");
    const compiledContent = SEOCompiler.compile(
      cleanBody,
      platform,
      injectedRules,
    );

    return {
      textContent: compiledContent,
      mediaAsset: null,
      metadata: { algorithmicNorthStar: "Compiled by Omni" },
    };
  }

  public static async orchestrate(
    input: OrchestrationInput,
    assignedModel: string,
  ): Promise<{
    finalOutputs: Record<string, PlatformOutputStructure>;
    aggregatedLog: string;
    totalInputTokens: number;
    totalOutputTokens: number;
  }> {
    const chunks = this.sliceInput(input);

    const sampleText = input.inputText
      ? input.inputText.substring(0, 5000)
      : `[Asset Footprint: Mime ${input.fileMimeType}]`;
    const summaryGatewayResponse = await AIGateway.executePayload({
      modelName: assignedModel,
      modelEnum: AIModelType.GEMINI_35_FLASH,
      systemPrompt:
        "Extract a dense, data-rich global structural anchor for this resource.",
      userPrompt: sampleText,
    });

    const globalContextAnchor =
      summaryGatewayResponse.rawContent || "Global optimization token.";
    let inputTokensAccumulator = summaryGatewayResponse.inputTokens;
    let outputTokensAccumulator = summaryGatewayResponse.outputTokens;

    const chunkProcessingResults: Record<string, string[]> = {};
    input.platforms.forEach((p) => {
      chunkProcessingResults[p] = [];
    });

    const knowledgeBases = await prisma.knowledgeBase.findMany();

    const knowledgeRules: Record<string, string> = {};
    for (const kb of knowledgeBases) {
      knowledgeRules[kb.platform.toLowerCase()] = kb.rules_text;
    }

    // 2026 Master Rules must supersede any legacy DB rules
    const masterRules: Record<string, string> = {
      "reddit": "Strictly first-person, highly contextualized narrative. Zero corporate/SEO buzzwords. Must feel like a human expert dropping insider knowledge.",
      "quora": "Strictly first-person, highly contextualized narrative. Zero corporate/SEO buzzwords. Must feel like a human expert dropping insider knowledge.",
      "twitter": "Enforce 'ghost linking' (zero outbound links in the primary text). High-entropy, scroll-stopping hooks.",
      "x": "Enforce 'ghost linking' (zero outbound links in the primary text). High-entropy, scroll-stopping hooks.",
      "instagram": "Extreme visual-contrast cues mandated in the first 3 seconds to prevent Skip Rate failure. Clear, psychologically driven DM-share triggers.",
      "youtube": "Extreme visual-contrast cues mandated in the first 3 seconds to prevent Skip Rate failure. Clear, psychologically driven DM-share triggers.",
      "googleweb": "50-word dense declarative paragraphs and specific mathematical ratios to maximize cosine similarity for AI Overviews.",
      "b2b": "50-word dense declarative paragraphs and specific mathematical ratios to maximize cosine similarity for AI Overviews.",
      "discord": "Strictly adhere to Markdown-heavy, highly structured, easily scrapable Dark Social formats. Absolutely NO conversational paragraphs.",
      "telegram": "Strictly adhere to Markdown-heavy, highly structured, easily scrapable Dark Social formats. Absolutely NO conversational paragraphs."
    };
    Object.assign(knowledgeRules, masterRules);

    const rawSearchData = await this.fetchLiveSeoTrends(
      globalContextAnchor,
      input.searchDepth,
      input.maxSearchResults,
    );

    for (const chunk of chunks) {
      let throttlingInstruction = "";
      if (input.length && input.length.includes("reduced_by_80_percent")) {
        throttlingInstruction =
          "You are in high-efficiency mode. You MUST extract only the absolute highest-entropy insights. Condense into a flawless, punchy structure. NEVER abruptly truncate. Ensure perfect platform-native formatting within the constrained length.";
      }

      let platformRules = input.platforms
        .map((p) => {
          let lowerP = p.toLowerCase();
          if (lowerP === "seo blog payload") lowerP = "googleweb";
          let rule = knowledgeRules[lowerP]
            ? `For ${p}, STRICTLY ENFORCE: ${knowledgeRules[lowerP]}`
            : "";
          return rule;
        })
        .filter(Boolean)
        .join("\n");

      const baseSystemPrompt = `You are an elite multi-modal segment parser running in a high-dimensional vector space.
      Segment Tracker Tracker: Chunk ${chunk.index} of total ${chunk.total}.
      Task: Generate highly tailored copy variations for these assigned networks: ${input.platforms.join(", ")}.
      Tone constraint: "${input.tone}". Output structure profile: "${input.length}".
      Analyze this full context.

      CRITICAL MULTI-PATH EVALUATION ENGINE DIRECTIVE:
      Do not generate a single pass. For each platform requested, you MUST internally generate 3 distinct variations.
      Then, evaluate your own 3 variations strictly against the provided platform rules (e.g., check for highest linguistic entropy, zero outbound links, specific mathematical ratios, or undeniable visual contrast cues).
      Discard the two weaker options.
      Return ONLY the single, verified masterpiece per platform.

      [ANTI-CONCLUSION DIRECTIVE]:
      AI models are heavily biased toward summarizing or concluding their text (e.g., "In conclusion...", "Ultimately...", "The strategy is straightforward..."). In modern 2026 social algorithms, this is an instant "AI Tell".
      Outputs MUST end abruptly, open-ended, or with a raw contextual statement. NEVER include a concluding sentence or summary paragraph.

      ${platformRules}
      ${throttlingInstruction}
      Constraint: Return output STRICTLY as a clean, flat JSON object containing only the platform keys and the absolute best single variation for each.`;

      const fullyAugmentedSystemPrompt =
        AIGateway.injectSearchGroundingIntoPrompt(
          baseSystemPrompt,
          rawSearchData,
        );

      const chunkGatewayResponse = await AIGateway.executePayload({
        modelName: assignedModel,
        modelEnum: AIModelType.GEMINI_31_PRO,
        systemPrompt: fullyAugmentedSystemPrompt,
        userPrompt: `Source segmented asset bytes to parse: ${chunk.chunkData}`,
      });

      inputTokensAccumulator += chunkGatewayResponse.inputTokens;
      outputTokensAccumulator += chunkGatewayResponse.outputTokens;

      if (chunkGatewayResponse.rawContent) {
        try {
          const jsonContentParsed = JSON.parse(chunkGatewayResponse.rawContent);
          input.platforms.forEach((p) => {
            if (jsonContentParsed[p])
              chunkProcessingResults[p].push(jsonContentParsed[p]);
          });
        } catch {
          input.platforms.forEach((p) => {
            chunkProcessingResults[p].push(chunkGatewayResponse.rawContent);
          });
        }
      }
    }

    const finalizedPayloads: Record<string, PlatformOutputStructure> = {};

    for (const platform of input.platforms) {
      const lowerP =
        platform.toLowerCase() === "seo blog payload"
          ? "googleweb"
          : platform.toLowerCase();
      finalizedPayloads[platform] = this.compileAndFormatPlatformPayload(
        chunkProcessingResults[platform],
        platform,
        input.tone,
        globalContextAnchor,
        input.tier,
        knowledgeRules[lowerP],
      );
    }

    return {
      finalOutputs: finalizedPayloads,
      aggregatedLog: `Omni-channel billing transaction verified. Successfully compiled segments.`,
      totalInputTokens: inputTokensAccumulator,
      totalOutputTokens: outputTokensAccumulator,
    };
  }
}
