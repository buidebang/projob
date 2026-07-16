const fs = require('fs');
let content = fs.readFileSync('app/api/improve/route.ts', 'utf-8');

content = content.replace(
  'import { ProcessingOrchestrator } from "@/lib/processing-orchestrator";',
  'import { ProcessingOrchestrator as CoreOrchestrator } from "@/lib/processing-orchestrator";\nimport { ProcessingOrchestrator as AIOrchestrator } from "@/lib/ai/orchestrator";'
);

fs.writeFileSync('app/api/improve/route.ts', content);
