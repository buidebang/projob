import fs from "fs";
import path from "path";

function minifyText(text: string): string {
    let minified = text;
    // Strip markdown formatting (bold, italic, headers)
    minified = minified.replace(/(\*\*|\*|__|#+)/g, '');
    // Remove extra whitespace and newlines
    minified = minified.replace(/\s+/g, ' ').trim();
    return minified;
}

const XML_ENFORCEMENT = `

You MUST format your output using strict XML tags inside your JSON 'message' field. Wrap your internal reasoning in <thoughts> tags, your tool execution plans in <call> tags, and your final user-facing answer in <response> tags. Do not output anything outside these tags in the message.`;

const ANTI_HALLUCINATION_BOX = "CRITICAL CONSTRAINT: You operate in a deterministic environment. Rely ONLY on injected tool responses, established chat history, or absolute facts. If a technical answer or context is unknown, output <halt_reason>UNKNOWN_DATA</halt_reason> and request assistance. NEVER guess. NEVER simulate unverified outputs. MUST ANTICIPATE USER NEEDS: Even if the prompt is short, provide comprehensive, 100% accurate, extremely dense outputs across any domain (SEO, coding, math, video generation logic).";

function getAgentPersona(intent: string): string {
    switch (intent) {
        case "SECURITY_AUDITOR":
            return "You are a Cyber-Security Architect. Prioritize zero-vulnerability and absolute system safety. Focus on vulnerabilities, zero-trust, ReDoS, injections.";
        case "UI_UX_ARCHITECT":
            return "You are a Frontend UI/UX Specialist. Prioritize responsive design and accessibility. Focus on accessibility, Tailwind efficiency, Framer Motion, touch targets.";
        case "DATABASE_ENGINEER":
            return "You are a Senior Backend & Database Engineer. Prioritize query optimization and data integrity. Focus on Prisma, CRDTs, transaction safety, row-locking.";
        case "PERFORMANCE_OPTIMIZER":
            return "You are a Performance Optimizer. Focus on Big-O notation, memory leaks, V8 heap management.";
        case "GENERAL_STRATEGIST":
        default:
            return "You are a Master Principal Engineer. Act with absolute technical precision.";
    }
}

function injectBlueprintComparator(basePrompt: string): string {
    return basePrompt + "\n\nBefore outputting the final <response>, you must internally compare your solution to industry absolute best practices. If your structural confidence is below 90%, you must self-correct and rewrite the variables to achieve perfect synchronization.";
}

function injectProbabilisticDebugging(basePrompt: string): string {
    return basePrompt + "\n\nWhen diagnosing errors or bugs, you MUST NOT return a single, absolute, monolithic point of failure. You must utilize 'Relativistic Measurement'. The output MUST include a probabilistic breakdown (e.g., 'Root Cause Probability: 75% Variable Mutation, 15% Network Latency, 10% Syntax Error'). You must treat all diagnostic results as probabilities.";
}

export async function weavePrompt(prompt: string, chatHistory: string = "", memoryContext: string = "", tier: string = "FREE"): Promise<{ wovenPrompt: string; sourceUsed: string }> {

    const isCoding = /code|system|architecture|error|bug|function/i.test(prompt);
    const isReasoning = /why|how|analyze|think|explain/i.test(prompt);
    const isUI = /ui|ux|browser|click|navigate|frontend|react/i.test(prompt);

    let wovenPrompt = "";
    let sourceUsed = "multi-gene-mosaic";
    const cacheDir = path.join(process.cwd(), "lib", "cognitive-vault", "cache");

    let combined = "";

    const isSecurity = /security|vulnerability|hack|auth|protect/i.test(prompt);
    const isBackendDB = /database|sql|prisma|schema|postgres|crdt/i.test(prompt);
    const isBugFix = /bug|fix|error|crash|exception/i.test(prompt);
    const isPerf = /performance|memory leak|big-o|v8|heap/i.test(prompt);

    let intent = "GENERAL_STRATEGIST";
    if (isSecurity) intent = "SECURITY_AUDITOR";
    else if (isUI) intent = "UI_UX_ARCHITECT";
    else if (isBackendDB) intent = "DATABASE_ENGINEER";
    else if (isPerf) intent = "PERFORMANCE_OPTIMIZER";

    let personaInjection = getAgentPersona(intent);
    combined += personaInjection + "\n\n";

    // PRIORITY SYSTEM: Code > Reasoning > UI/Media
    if (isCoding) {
        try {
            const baseContent = await fs.promises.readFile(path.join(cacheDir, "claude-code.txt"), "utf8");
            combined += baseContent;

            const claudeCodeOpusPath = path.join(cacheDir, "claude-system-prompt", "system-prompt", "@claude-code", "v2.1.2-opus-4.5.md");
            if (fs.existsSync(claudeCodeOpusPath)) {
                const claudeCodeOpus = await fs.promises.readFile(claudeCodeOpusPath, "utf8");
                const matches = claudeCodeOpus.match(/<function>[\s\S]*?"name":\s*"(Bash|Grep)"[\s\S]*?<\/function>/gi);
                if (matches) combined += "\n" + matches.join("\n");
            }
        } catch (e) {
            combined += "Analyze carefully and provide execution steps.";
        }
    } else if (isReasoning) {
        try {
            const gpt55Path = path.join(cacheDir, "system_prompts_leaks", "OpenAI", "gpt-5.5-thinking.md");
            if (fs.existsSync(gpt55Path)) {
                const gpt55 = await fs.promises.readFile(gpt55Path, "utf8");
                combined += gpt55.substring(0, 5000);
            }
        } catch (e) {
            console.warn("Failed to read gpt-5.5-thinking.md:", e);
        }
    } else if (isUI) {
        try {
            const claudeInChromePath = path.join(cacheDir, "system_prompts_leaks", "Anthropic", "claude-in-chrome.md");
            if (fs.existsSync(claudeInChromePath)) {
                const claudeInChrome = await fs.promises.readFile(claudeInChromePath, "utf8");
                const match = claudeInChrome.match(/<critical_injection_defense>[\s\S]*?<\/critical_injection_defense>/gi);
                if (match) combined += "\n" + match.join("\n");
            }
        } catch (e) {
            console.warn("Failed to extract Browser Automation rules:", e);
        }
    } else {
        // Fallback default
        combined += "Provide a comprehensive and accurate response.";
    }

    if (tier === "FREE" || tier === "GUEST") {
        if (prompt.includes("REQUIRES_DEEP_COMPUTE") || prompt.includes("[UNKNOWN_CHUNK]")) {
            combined += `\n\nCRITICAL MULTIMODAL TRIAGE DIRECTIVE: You have received a file that contains [UNKNOWN_CHUNK]s or is tagged with REQUIRES_DEEP_COMPUTE. Because the user is on the Guest/Free tier, you MUST completely ignore the unknown chunks and flawlessly process only the known sections. You MUST also append the following EXACT string at the very end of your <response>:\n\n"System Alert: Highly complex or unrecognized data blocks detected. To maintain 100% unparalleled output quality within the Guest Tier, these blocks were quarantined and bypassed. Please login or select a higher Compute Multiplier (2x, 3x, 4x) for Deep AI Structural Analysis."`;
        }

        combined += `
You are operating under a strict token limit. You MUST keep <thoughts> extremely brief (under 3 sentences). You MUST deliver a highly compressed, concise, yet 100% accurate <response>. Do not generate long lists. Ensure all JSON/XML tags are properly closed. You are under severe token constraints. Bypass all reasoning commentary. You MUST compress your response into the absolute highest density of factual/functional output. Provide only the finalized code/solution.`;
        wovenPrompt = minifyText(combined);
        // Smart truncation: avoid cutting tags mid-way by finding the last proper boundary
        if (wovenPrompt.length > 7500) {
            let chopped = wovenPrompt.substring(0, 7500);
            const lastTagOpen = chopped.lastIndexOf('<');
            const lastTagClose = chopped.lastIndexOf('>');
            if (lastTagOpen > lastTagClose) {
                // Cut before the unclosed tag
                chopped = chopped.substring(0, lastTagOpen);
            }
            wovenPrompt = chopped;
        }
    } else {
        combined += `
Use extensive, deep Chain-of-Thought in <thoughts> and deliver extremely dense, exhaustive <response> outputs.`;
        // Premium: no minification, max context
        wovenPrompt = combined;
        if (wovenPrompt.length > 30000) {
            wovenPrompt = wovenPrompt.substring(0, 30000);
            const lastTagOpen = wovenPrompt.lastIndexOf('<');
            const lastTagClose = wovenPrompt.lastIndexOf('>');
            if (lastTagOpen > lastTagClose) {
                wovenPrompt = wovenPrompt.substring(0, lastTagOpen);
            }
        }
    }

    wovenPrompt = injectBlueprintComparator(wovenPrompt);

    if (isBugFix) {
        wovenPrompt = injectProbabilisticDebugging(wovenPrompt);
    }

    wovenPrompt += "\n\n" + ANTI_HALLUCINATION_BOX;
    if (chatHistory) wovenPrompt += "\nChat History:\n" + chatHistory;
    if (memoryContext) wovenPrompt += "\nMemory Context:\n" + memoryContext;

    wovenPrompt += XML_ENFORCEMENT;

    return {
        wovenPrompt,
        sourceUsed
    };
}
