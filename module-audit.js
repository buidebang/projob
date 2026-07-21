const fs = require('fs');

const report = `
**PHASE 5 MODULE ACCESS MATRIX & SECURITY AUDIT**

1. **Rowboat (Graph Memory):**
   - **Access footprint:** Reads from user prompts/uploads. Writes context nodes to \`prisma.knowledgeBase\` and vector/metadata to Redis/Yjs sync structures (\`y-redis\`).
   - **Core Files Touched:** \`lib/ai/orchestrator.ts\`, \`lib/ai/compiler.ts\`, \`prisma/schema.prisma\` (KnowledgeNode/KnowledgeBase models).
   - **Data flow:** Input -> Extraction -> Vector/DB -> Output context injection.

2. **TryAI (Audit Loop):**
   - **Access footprint:** Intercepts worker output strings. Generates feedback and requests re-generation if constraints fail.
   - **Core Files Touched:** \`lib/processing-orchestrator.ts\` (Mocked in \`/api/jobs/process\`), \`lib/ai/validator.ts\`.
   - **Data flow:** Worker Output -> TryAI -> Validation/Rejection -> GraphMemory.

3. **Graphify (Data Vis/Execution Maps):**
   - **Access footprint:** Reads intermediate \`ExecutionPlan\` structures. Triggers client-side downloads (\`.json\` files).
   - **Core Files Touched:** \`app/(protected)/dashboard/page.tsx\` (Export Execution Map button), \`lib/ai/orchestrator.ts\`.
   - **Data flow:** ExecutionPlan -> JSON Blob -> User Download.

4. **Skillscript (Runtime Extensibility):**
   - **Access footprint:** Parses user intent and translates it into standard orchestrator inputs (platforms, length, tone).
   - **Core Files Touched:** \`lib/ai/orchestrator.ts\`, \`lib/processing-orchestrator.ts\`.
   - **Data flow:** Raw prompt -> Skillscript Parser -> OrchestrationInput.

5. **Grok-Build (Execution Generation):**
   - **Access footprint:** Used primarily within the "Audit Workspace" (\`/improve\`) flow to generate AST maps and plan generation.
   - **Core Files Touched:** \`app/api/improve/route.ts\`.
   - **Data flow:** Workspace structure -> Grok-Build analysis -> JSON plan (Tech Debt, Security).

6. **Improve (Shadcn Master-Worker Protocol):**
   - **Access footprint:** Handles the heavy lifting of structural codebase audits and generating "worker execution steps".
   - **Core Files Touched:** \`app/api/improve/route.ts\`.
   - **Data flow:** AST mapping -> Improve Protocol -> Worker Steps array.

7. **DeepSearch Engine:**
   - **Access footprint:** External web scraping via Jina AI. Extracts high entropy payloads. Deducts Abstract Credits.
   - **Core Files Touched:** \`lib/ai/deep-search.ts\`, \`lib/processing-orchestrator.ts\`.
   - **Data flow:** URL -> DeepSearch -> Markdown -> LLM prompt.

8. **AIGateway (Universal LLM Routing):**
   - **Access footprint:** Base routing layer for Google/OpenAI/Anthropic APIs. Token compression. Rate limit fallback.
   - **Core Files Touched:** \`lib/ai-gateway.ts\`, \`lib/ai/orchestrator.ts\`.
   - **Data flow:** Standardized Prompt -> AIGateway -> Specific LLM Provider.

---

**ADMIN UI GAP ANALYSIS:**

The current \`ApiManagementForm\` (\`components/admin/api-management-form.tsx\`) only handles basic model keys and Emergency Mode fallback routing.

**Missing Controls (Critical Gaps):**
1. **Graph Memory Management (Rowboat):** No UI to view, prune, or wipe the \`KnowledgeBase\` vector store.
2. **Audit Strictness Slider (TryAI):** No way to globally configure how strict the self-critique loop is (e.g., "Lenient" vs "Maximum Entropy").
3. **Concurrency Limiter Throttle:** No way to dynamically adjust the \`concurrencyLimit\` parameter in the \`ProcessingOrchestrator\` to manage API rate limits.
4. **DeepSearch Token Cap:** No UI to limit the maximum size of scraped payloads from the \`DeepSearchEngine\`.
`;

console.log(report);
