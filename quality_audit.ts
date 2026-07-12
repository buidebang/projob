import { ProcessingOrchestrator } from './lib/ai/orchestrator.ts';
import * as fs from 'fs';

async function runQualityAudit() {
    console.log("=== 🔴 STAGE 3: DEEP-CODE PRECISION METRICS ===");

    // Inject API key into env
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const orchestrator = new ProcessingOrchestrator();

    // The Logic: Extract a specific module/function
    const deepCodePrompt = "Generate ONLY the caching layer logic for a Next.js 15+ Edge-compatible API route. It must implement Stale-While-Revalidate (SWR) with a Redis fallback and include rigorous memory safety checks. Do not include boilerplate or explanations. Strict YAGNI compliance.";
    const ragContext = "2026 Directives: Code must be hyper-dense and precise. Never output summary conclusions. Edge-runtime compliant.";

    try {
        console.log(`\nGenerating Deep-Code Precision Benchmark...`);
        const resultDeepCode = await orchestrator.executeComplexRequest(deepCodePrompt, ragContext);
        fs.writeFileSync('./quality-benchmarks/our-outputs/deep-code-output.json', JSON.stringify(resultDeepCode, null, 2));

        console.log("Output saved successfully to /quality-benchmarks/our-outputs/deep-code-output.json");
    } catch (e: any) {
        console.error("\n--- ARCHITECTURAL WEAKNESS LOG (FAILURE CAUGHT) ---");
        console.error(e.message);
    }
}

runQualityAudit().catch(console.error);
