const fs = require('fs');

let content = fs.readFileSync('app/api/improve/route.ts', 'utf-8');

// The file is using `ProcessingOrchestrator` which probably imports from `lib/processing-orchestrator` instead of `lib/ai/orchestrator`
// Let's import the specific class from orchestrator
content = content.replace("import { ProcessingOrchestrator } from '@/lib/processing-orchestrator';", "import { ProcessingOrchestrator as CoreOrchestrator } from '@/lib/processing-orchestrator';\nimport { ProcessingOrchestrator as AIOrchestrator } from '@/lib/ai/orchestrator';");
content = content.replace("const orchestrator = new ProcessingOrchestrator();", "const orchestrator = new AIOrchestrator();");

fs.writeFileSync('app/api/improve/route.ts', content);
