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

export async function weavePrompt(prompt: string, chatHistory: string = "", memoryContext: string = ""): Promise<{ wovenPrompt: string; sourceUsed: string }> {


    const isCoding = /code|system|architecture|error|bug|function/i.test(prompt);
    const isReasoning = /why|how|analyze|think|explain/i.test(prompt);
    const isUI = /ui|ux|browser|click|navigate|frontend|react/i.test(prompt);

    let wovenPrompt = "";
    let sourceUsed = "multi-gene-mosaic";
    const cacheDir = path.join(process.cwd(), "lib", "cognitive-vault", "cache");

    // 1. Extract strict coding/system rules from Claude Code / Opus
    let baseContent = "";
    if (isCoding || isReasoning) {
        try {
            baseContent = await fs.promises.readFile(path.join(cacheDir, "claude-code.txt"), "utf8");
        } catch (e) {
            baseContent = "Analyze carefully and provide execution steps.";
        }
    }

    let bashGrepTools = "";
    if (isCoding) {
        try {
            const claudeCodeOpusPath = path.join(cacheDir, "claude-system-prompt", "system-prompt", "@claude-code", "v2.1.2-opus-4.5.md");
            const claudeCodeOpus = await fs.promises.readFile(claudeCodeOpusPath, "utf8");
            const matches = claudeCodeOpus.match(/<function>[\s\S]*?"name":\s*"(Bash|Grep)"[\s\S]*?<\/function>/gi);
            if (matches) {
                bashGrepTools = matches.join("\n");
            }
        } catch (e) {
            console.warn("Failed to extract Bash/Grep tools:", e);
        }
    }

    // 2. Extract specialized instructions (Browser Automation) from Anthropic
    let browserAutomation = "";
    if (isUI || isCoding) {
        try {
            const claudeInChromePath = path.join(cacheDir, "system_prompts_leaks", "Anthropic", "claude-in-chrome.md");
            const claudeInChrome = await fs.promises.readFile(claudeInChromePath, "utf8");
            const match = claudeInChrome.match(/<critical_injection_defense>[\s\S]*?<\/critical_injection_defense>/gi);
            if (match) {
                browserAutomation = match.join("\n");
            }
        } catch (e) {
            console.warn("Failed to extract Browser Automation rules:", e);
        }
    }

    // 3. Extract deep reasoning logic from GPT-5.5 Thinking
    let deepReasoning = "";
    if (isReasoning || !isCoding) {
        try {
            const gpt55Path = path.join(cacheDir, "system_prompts_leaks", "OpenAI", "gpt-5.5-thinking.md");
            const gpt55 = await fs.promises.readFile(gpt55Path, "utf8");
            // Extract a meaningful portion, as it's very large
            deepReasoning = gpt55.substring(0, 5000);
        } catch (e) {
            console.warn("Failed to read gpt-5.5-thinking.md:", e);
        }
    }

    // Combine and apply Extreme Minification
    let combined = `${baseContent} ${bashGrepTools} ${browserAutomation} ${deepReasoning}`;

    wovenPrompt = minifyText(combined);
    // Compress the synthesized rules into ultra-dense, strict instructional blocks (under 2,000 tokens/chars)
    wovenPrompt = wovenPrompt.substring(0, 7500);



    const ANTI_HALLUCINATION_BOX = "CRITICAL CONSTRAINT: You operate in a deterministic environment. Rely ONLY on injected tool responses, established chat history, or absolute facts. If a technical answer or context is unknown, output <halt_reason>UNKNOWN_DATA</halt_reason> and request assistance. NEVER guess. NEVER simulate unverified outputs.";

    wovenPrompt += "\n" + ANTI_HALLUCINATION_BOX;
    if (chatHistory) wovenPrompt += "\nChat History:\n" + chatHistory;
    if (memoryContext) wovenPrompt += "\nMemory Context:\n" + memoryContext;

    wovenPrompt += XML_ENFORCEMENT;

    return {
        wovenPrompt,
        sourceUsed
    };
}
