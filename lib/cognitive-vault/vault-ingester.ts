import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";

export async function getDistilledPrompt(promptName: string): Promise<string> {
    const cacheDir = path.join(process.cwd(), "lib", "cognitive-vault", "cache");
    const targetFile = path.join(cacheDir, `${promptName}.txt`);
    if (fs.existsSync(targetFile)) {
        return fs.readFileSync(targetFile, "utf8");
    }
    // Return a default distillation prompt if not found
    return `<thoughts>Analyze carefully.</thoughts><call>Plan execution.</call><response>Execute.</response>`;
}

export async function ingestVault(workflowFilePath: string) {
    if (!fs.existsSync(workflowFilePath)) {
        console.warn("Vault workflow file not found at", workflowFilePath);
        return;
    }
    const content = fs.readFileSync(workflowFilePath, "utf8");
    const doc = yaml.load(content) as any;

    const cacheDir = path.join(process.cwd(), "lib", "cognitive-vault", "cache");
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (const source of doc.sources) {
        console.log(`Ingesting from: ${source.url}`);
        try {
            // Simulated fetch for demonstration since we don't have real github access to these specific repos in the sandbox
            const simulatedResponse = `[DISTILLED SYSTEM PROMPT FROM ${source.name}]\n<thoughts>...</thoughts>\n<call>...</call>\n<response>...</response>`;
            const targetFile = path.join(cacheDir, `${source.name}.txt`);
            fs.writeFileSync(targetFile, simulatedResponse);
        } catch (e: any) {
            console.error(`Failed to ingest ${source.url}:`, e.message);
        }
    }
}
