import { ProcessingOrchestrator, AIGateway, ExecutionPlan } from './lib/ai/orchestrator';

// 2. Mock the Infrastructure
// We monkey-patch the prototype to intercept external calls and provide dummy responses

AIGateway.prototype.pingMaster = async function(prompt: string, masterProfile: string, ragContext: string = ""): Promise<ExecutionPlan> {
  console.log(`[Trace 1: Master] Master Orchestrator analyzing prompt: "${prompt}"`);
  console.log(`[Trace 1: Master] Creating Adaptive Mind Map (Execution Plan)`);
  return {
    tasks: [
      { id: "task-1", description: "Analyze architectural security", assignedWorker: "worker-A" },
      { id: "task-2", description: "Generate implementation plan", assignedWorker: "worker-B" }
    ],
    orchestrationStrategy: "Parallel security analysis"
  };
};

AIGateway.prototype.pingWorker = async function(task: any, ragContext: string = ""): Promise<string> {
  console.log(`[Trace 2: WorkerNode] Task delegated. Executing task ${task.id} (${task.description})`);

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));

  const rawOutput = `Completed task ${task.id}: Architectural blueprint generated.`;

  // 3. Trace 3: AuditLoop (Self-Critique)
  console.log(`[Trace 3: AuditLoop] Running self-critique on output of ${task.id}...`);
  const verifiedOutput = `${rawOutput} (Verified by AuditLoop: Passed Security Checks)`;

  return verifiedOutput;
};

async function runSimulation() {
  console.log("=== BEGINNING NEURAL FLOW SIMULATION ===");

  const orchestrator = new ProcessingOrchestrator();
  const dummyPrompt = "Analyze this code and generate a secure architectural plan";

  try {
    const results = await orchestrator.executeComplexRequest(dummyPrompt, "Mock Context");

    // Trace 4: GraphMemory
    console.log(`\n[Trace 4: GraphMemory (Rowboat)] Storing verified output in Graph Memory:`);
    results.forEach((res, index) => {
        console.log(`  -> Node ${index + 1}: ${res}`);
    });

    console.log("\n=== SIMULATION COMPLETE: NEURAL FLOW SUCCESSFUL ===");
  } catch (error) {
    console.error("Simulation failed:", error);
  }
}

runSimulation();
