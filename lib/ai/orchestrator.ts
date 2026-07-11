type WorkerProfile = 'llama-3' | 'glm';
type MasterProfile = 'gpt-4o' | 'claude-3-5-sonnet';

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

  // Mock Master model generating an execution plan
  public async pingMaster(prompt: string, masterProfile: MasterProfile): Promise<ExecutionPlan> {
    console.log(`[Master ${masterProfile}] Analyzing complex request...`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return a mocked structured JSON execution plan
    return {
      tasks: [
        { id: 'task-1', description: 'Analyze keywords', assignedWorker: 'llama-3' },
        { id: 'task-2', description: 'Generate drafts', assignedWorker: 'glm' },
        { id: 'task-3', description: 'Format for output', assignedWorker: 'llama-3' }
      ],
      orchestrationStrategy: 'Parallel processing for analysis and drafting, followed by final formatting.'
    };
  }

  // Mock Worker model processing a micro-task
  public async pingWorker(task: Task): Promise<string> {
    console.log(`[Worker ${task.assignedWorker}] Executing task: ${task.id} - ${task.description}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    return `[RESULT] Task ${task.id} completed by ${task.assignedWorker}.`;
  }
}

export class ProcessingOrchestrator {
  private gateway = new AIGateway();

  public async executeComplexRequest(prompt: string): Promise<string[]> {
    // 1. Audit to Execute via Master
    const plan = await this.gateway.pingMaster(prompt, 'gpt-4o');

    // 2. Delegate to Workers in parallel
    const workerPromises = plan.tasks.map(task => this.gateway.pingWorker(task));
    const results = await Promise.all(workerPromises);

    return results;
  }
}
