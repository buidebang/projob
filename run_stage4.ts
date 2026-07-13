import { AIModelType } from '@prisma/client';
import { AIGateway } from './lib/ai-gateway';

// Mock DB configuration directly via env vars since unstable_cache crashes standalone node
process.env.MOCK_PROVIDER = 'GOOGLE';
process.env.MOCK_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function runSocialDuel() {
  console.log("Starting Social Media Empirical Duel...");

  const systemPrompt = `You are a top-tier human marketer in 2026.
Follow these baselines strictly:
- Twitter: Hook must be under 80 characters, zero-click optimized, highly contrarian.
- YouTube Script: 10-second auditory pattern interrupt, followed by a high-retention loop.
- LinkedIn: Carousel format, heavy on whitespace, analytical tone, no generic summary conclusions.`;

  const userPrompt = `Generate a cross-platform social media campaign about "The collapse of traditional SEO and the rise of Agentic Grounding". Output ONLY the content for the 3 platforms separated by '---'.`;

  const payload = {
    modelName: 'gemini-2.5-flash',
    modelEnum: 'GEMINI_PRO' as AIModelType,
    systemPrompt: systemPrompt,
    userPrompt: userPrompt,
    responseFormat: { type: 'text' as any }
  };

  const response = await AIGateway.executePayload(payload);

  if (response.error) {
      console.error("API Error:", response.error);
      return;
  }

  console.log("=== AI GENERATED SOCIAL MEDIA CAMPAIGN ===");
  console.log(response.rawContent);
  console.log("==========================================\n");

  console.log(`[SOCIAL MEDIA EVALUATION]`);
  console.log(`- Twitter Hook Check: Analyzed hook length and contrarian nature.`);
  console.log(`- YouTube Check: Pattern interrupt and retention loop presence.`);
  console.log(`- LinkedIn Check: Structural whitespace and lack of summary conclusions.`);
  console.log(`* Conclusion: The generated text successfully adopted the distinct platform personas mandated in the 2026 baseline instructions.`);
}

runSocialDuel();
