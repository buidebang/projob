import { z } from 'zod';

type WorkerProfile = 'gemini-2.5-flash' | string;
type MasterProfile = 'gemini-2.5-flash' | string;

export interface Task {
  id: string;
  description: string;
  assignedWorker: WorkerProfile;
}

export interface ExecutionPlan {
  tasks: Task[];
  orchestrationStrategy: string;
}

export const ActiveJobRegistry = new Map<string, AbortController>();

export class AIGateway {
  private apiKey = process.env.GEMINI_API_KEY;

  public async pingMaster(prompt: string, masterProfile: MasterProfile, ragContext: string = "", signal?: AbortSignal): Promise<ExecutionPlan> {
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
      }),
      signal
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

  public async pingWorker(task: Task, ragContext: string = "", signal?: AbortSignal): Promise<string> {
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
      }),
      signal
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

  public async executeComplexRequest(prompt: string, ragContext: string = "July 2026 SEO Directives: Optimizing for Generative Engine Optimization (GEO).", jobId?: string): Promise<string[]> {
    let signal: AbortSignal | undefined;

    if (jobId) {
      const controller = new AbortController();
      ActiveJobRegistry.set(jobId, controller);
      signal = controller.signal;
    }

    try {
      const plan = await this.gateway.pingMaster(prompt, 'gemini-2.5-flash', ragContext, signal);

      if (signal && signal.aborted) throw new Error("ABORT_SIGNAL");

      console.log(`\n[Execution Plan Parsed]`);
      console.log(JSON.stringify(plan, null, 2));

      const results: string[] = [];
      const concurrencyLimit = 2;
      const tasks = plan.tasks;

      for (let i = 0; i < tasks.length; i += concurrencyLimit) {
        if (signal && signal.aborted) throw new Error("ABORT_SIGNAL");

        const batch = tasks.slice(i, i + concurrencyLimit);

        const workerPromises = batch.map(task => {
          const workerModel = 'gemini-2.5-flash';
          return this.gateway.pingWorker({ ...task, assignedWorker: workerModel }, ragContext, signal);
        });

        const batchResults = await Promise.all(workerPromises);
        results.push(...batchResults);

        if (i + concurrencyLimit < tasks.length) {
          console.log(`[Concurrency Limiter] Waiting 2000ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return results;
    } finally {
      if (jobId) {
        ActiveJobRegistry.delete(jobId);
      }
    }
  }

  public static killJob(jobId: string) {
    if (ActiveJobRegistry.has(jobId)) {
      ActiveJobRegistry.get(jobId)?.abort();
      ActiveJobRegistry.delete(jobId);
    }
  }
}
