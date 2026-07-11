import { PrismaClient } from '@prisma/client';
import { DistributionSensor } from './lib/telemetry/distribution_sensor';
import { AntiBloatInjector } from './lib/ai/anti-bloat';
import { ProcessingOrchestrator, AIGateway } from './lib/ai/orchestrator';

const prisma = new PrismaClient();

async function runPhase3Simulation() {
  console.log("=== PHASE 3 SIMULATION START ===\n");

  // 1. The HITL Proof
  console.log("--- 1. The Kastra Protocol (HITL) ---");
  const sensor = new DistributionSensor();

  // Create dummy posts for testing batch (length > 5)
  const dummyUser = await prisma.user.create({
    data: {
      email: `hitl-${Date.now()}@example.com`,
      name: 'HITL Tester',
    }
  });

  const posts = Array(6).fill(null).map((_, i) => ({
    userId: dummyUser.id,
    platform: 'Twitter',
    content: `Batch post ${i}`,
    scheduledFor: new Date(),
    status: 'PENDING' as any
  }));

  const createdPosts = await Promise.all(posts.map(p => prisma.scheduledPost.create({ data: p })));

  console.log("Attempting to schedule 6 posts simultaneously...");
  const evaluatedPosts = await sensor.evaluateRisk(createdPosts);

  const hitlProof = evaluatedPosts.map(p => ({
    id: p.id,
    status: p.status,
    authorizationRequired: p.authorizationRequired,
    authorizationToken: p.authorizationToken ? "GENERATED_TOKEN" : null
  }));
  console.log("HITL Proof Result:\n", JSON.stringify(hitlProof, null, 2));

  // 2. The Ponytail Impact
  console.log("\n--- 2. The Ponytail Protocol (Anti-Bloat) ---");
  const originalPrompt = "Write a short summary of SEO trends.";
  const injectedPrompt = AntiBloatInjector.inject(originalPrompt);

  console.log("Original Prompt:\n", originalPrompt);
  console.log("\nInjected Prompt (with YAGNI constraints):\n", injectedPrompt);

  const validationResult = AntiBloatInjector.validate(10, 200, 10);
  console.log("\nValidation (10 prompt tokens vs 200 response tokens):", validationResult);


  // 3. The Master-Worker JSON
  console.log("\n--- 3. The Improve Protocol (Master-Worker) ---");
  const orchestrator = new ProcessingOrchestrator();
  const gateway = new AIGateway();

  const complexPrompt = "Create a 30-day SEO content strategy.";
  const masterPlan = await gateway.pingMaster(complexPrompt, 'gpt-4o');

  console.log("Master Generated JSON Plan:\n", JSON.stringify(masterPlan, null, 2));

  console.log("\nExecuting tasks in parallel via workers...");
  const results = await orchestrator.executeComplexRequest(complexPrompt);
  console.log("\nFinal Worker Results:\n", results);

  console.log("\n=== PHASE 3 SIMULATION END ===");
}

runPhase3Simulation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
