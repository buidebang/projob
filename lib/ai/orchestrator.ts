import { z } from 'zod';

type WorkerProfile = 'gemini-2.5-flash' | string;
type MasterProfile = 'gemini-2.5-flash' | string; // Switching Master to flash to see if it bypasses the 2.5-pro quota limit

export interface Task {
  id: string;
  description: string;
  assignedWorker: WorkerProfile;
}

export interface ExecutionPlan {
  tasks: Task[];
  orchestrationStrategy: string;
}

export class AIGateway {
  private apiKey = process.env.GEMINI_API_KEY;

  // Master model generating an execution plan
  public async pingMaster(prompt: string, masterProfile: MasterProfile, ragContext: string = ""): Promise<ExecutionPlan> {
    console.log(`[Master gemini-2.5-flash] Analyzing complex request with REAL Google Gemini API...`);

    const systemPrompt = `You are a Master Orchestrator. Output STRICT JSON only. Do not wrap in markdown blocks or use backticks, just raw JSON matching this schema: { "tasks": [{ "id": "string", "description": "string", "assignedWorker": "string" }], "orchestrationStrategy": "string" }. RAG Rules: ${ragContext}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: { parts: { text: systemPrompt } },
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Master API Failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;

    try {
        const parsed = JSON.parse(resultText);
        return parsed as ExecutionPlan;
    } catch (e) {
        throw new Error(`Master API returned invalid JSON: ${resultText}`);
    }
  }

  // Worker model processing a micro-task
  public async pingWorker(task: Task, ragContext: string = ""): Promise<string> {
    console.log(`[Worker ${task.assignedWorker}] Executing task: ${task.id} - ${task.description}`);

    const systemPrompt = `You are an AI Worker. Complete the task based on the description. RAG Rules: ${ragContext}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: { parts: { text: systemPrompt } },
        contents: [
          { role: 'user', parts: [{ text: `Task: ${task.description}` }] }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Worker API Failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

export class ProcessingOrchestrator {
  private gateway = new AIGateway();

  public async executeComplexRequest(prompt: string, ragContext: string = "July 2026 SEO Directives: Optimizing for Generative Engine Optimization (GEO)."): Promise<string[]> {
    // 1. Audit to Execute via Master
    const plan = await this.gateway.pingMaster(prompt, 'gemini-2.5-flash', ragContext);

    console.log(`\n[Execution Plan Parsed]`);
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
        console.log(`[Concurrency Limiter] Waiting 2000ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }
}
