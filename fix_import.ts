import fs from "fs";

let code = fs.readFileSync("app/api/orchestrator/route.ts", "utf8");

// Move the import to the top
const importStr = "import { NeuralCodeMapper } from '@/lib/cognitive-vault/neural-mapper';\n";

if (code.includes(importStr)) {
    code = code.replace(importStr, "");
    // Add to the top
    const lines = code.split('\n');
    let insertIndex = 0;
    while (lines[insertIndex].startsWith('import ')) {
        insertIndex++;
    }
    lines.splice(insertIndex, 0, importStr.trim());
    fs.writeFileSync("app/api/orchestrator/route.ts", lines.join('\n'));
    console.log("Import moved to top.");
} else {
    console.log("Import not found or already moved.");
}
