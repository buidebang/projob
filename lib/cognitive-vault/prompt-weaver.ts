import fs from "fs";
import path from "path";

const XML_ENFORCEMENT = `

You MUST format your output using strict XML tags inside your JSON 'message' field. Wrap your internal reasoning in <thoughts> tags, your tool execution plans in <call> tags, and your final user-facing answer in <response> tags. Do not output anything outside these tags in the message.`;

export async function weavePrompt(prompt: string): Promise<{ wovenPrompt: string; sourceUsed: string }> {
    const isCoding = /code|system|architecture|error|bug|function/i.test(prompt);

    let wovenPrompt = "";
    let sourceUsed = "";
    const cacheDir = path.join(process.cwd(), "lib", "cognitive-vault", "cache");

    if (isCoding) {
        // Modular Prompt Composition for Coding
        sourceUsed = "claude-code-distilled";

        let baseContent = "";
        try {
            baseContent = await fs.promises.readFile(path.join(cacheDir, "claude-code.txt"), "utf8");
        } catch (e) {
            baseContent = "Analyze carefully and provide execution steps.";
        }

        let bashGrepTools = "";
        try {
            const claudeCodeOpusPath = path.join(cacheDir, "claude-system-prompt", "system-prompt", "@claude-code", "v2.1.2-opus-4.5.md");
            const claudeCodeOpus = await fs.promises.readFile(claudeCodeOpusPath, "utf8");

            const matches = claudeCodeOpus.match(/<function>[\s\S]*?"name":\s*"(Bash|Grep)"[\s\S]*?<\/function>/gi);
            if (matches) {
                bashGrepTools = matches.join("\n").substring(0, 1500);
            }
        } catch (e) {
            console.warn("Failed to extract Bash/Grep tools:", e);
        }

        let browserAutomation = "";
        try {
            const claudeInChromePath = path.join(cacheDir, "system_prompts_leaks", "Anthropic", "claude-in-chrome.md");
            const claudeInChrome = await fs.promises.readFile(claudeInChromePath, "utf8");

            const match = claudeInChrome.match(/<critical_injection_defense>[\s\S]*?<\/critical_injection_defense>/gi);
            if (match) {
                browserAutomation = match.join("\n").substring(0, 1500);
            }
        } catch (e) {
            console.warn("Failed to extract Browser Automation rules:", e);
        }

        baseContent = baseContent.substring(0, 4000);
        wovenPrompt = `${baseContent}\n\n${bashGrepTools}\n\n${browserAutomation}`;
        wovenPrompt = wovenPrompt.substring(0, 8000);
    } else {
        // Distilled GPT-5.5-Thinking for Deep Reasoning
        sourceUsed = "gpt-5.5-thinking";

        try {
            const gpt55Path = path.join(cacheDir, "system_prompts_leaks", "OpenAI", "gpt-5.5-thinking.md");
            wovenPrompt = await fs.promises.readFile(gpt55Path, "utf8");
            wovenPrompt = wovenPrompt.substring(0, 8000);
        } catch (e) {
            console.warn("Failed to read gpt-5.5-thinking.md, falling back to claude-fable-5:", e);
            try {
                wovenPrompt = await fs.promises.readFile(path.join(cacheDir, "claude-fable-5.txt"), "utf8");
                wovenPrompt = wovenPrompt.substring(0, 8000);
            } catch (fallbackErr) {
                wovenPrompt = "Analyze carefully and provide execution steps.";
            }
        }
    }

    wovenPrompt += XML_ENFORCEMENT;

    return {
        wovenPrompt,
        sourceUsed
    };
}
