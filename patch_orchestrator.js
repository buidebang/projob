const fs = require('fs');

let content = fs.readFileSync('lib/processing-orchestrator.ts', 'utf-8');

if (!content.includes('orchestrationMode?: string;')) {
    content = content.replace('searchDepth: "none" | "basic" | "advanced" | "extreme";', 'searchDepth: "none" | "basic" | "advanced" | "extreme";\n  orchestrationMode?: string;');
}

fs.writeFileSync('lib/processing-orchestrator.ts', content);
