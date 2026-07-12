const fs = require('fs');

const path = 'lib/ai/orchestrator.ts';
let content = fs.readFileSync(path, 'utf-8');

// Fix 3: Concurrency Throttling in ProcessingOrchestrator
const newExecuteMethod = `
  public async executeComplexRequest(prompt: string, ragContext: string = "July 2026 SEO Directives: Optimizing for Generative Engine Optimization (GEO)."): Promise<string[]> {
    // 1. Audit to Execute via Master
    const plan = await this.gateway.pingMaster(prompt, 'gemini-2.5-flash', ragContext);

    console.log(\`\\n[Execution Plan Parsed]\`);
    console.log(JSON.stringify(plan, null, 2));

    // 2. Delegate to Workers in parallel with Concurrency Limiter
    const results: string[] = [];
    const concurrencyLimit = 2;
    const tasks = plan.tasks;

    for (let i = 0; i < tasks.length; i += concurrencyLimit) {
      const batch = tasks.slice(i, i + concurrencyLimit);

      const workerPromises = batch.map(task => {
        const workerModel = 'gemini-2.5-flash';
        return this.gateway.pingWorker({ ...task, assignedWorker: workerModel }, ragContext);
      });

      const batchResults = await Promise.all(workerPromises);
      results.push(...batchResults);

      if (i + concurrencyLimit < tasks.length) {
        console.log(\`[Concurrency Limiter] Waiting 2000ms before next batch...\`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }
`;

content = content.replace(/public async executeComplexRequest[\s\S]*?return results;\n  }/m, newExecuteMethod.trim());
fs.writeFileSync(path, content);
