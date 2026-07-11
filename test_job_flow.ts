import { PrismaClient } from '@prisma/client';
import crypto from "crypto";
const prisma = new PrismaClient();

const WEBHOOK_SECRET = "internal-dev-secret-key-12345";

function generateSignature(payload: string): string {
  return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
}

async function run() {
  console.log("Creating mock user...");
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@test.com`,
      name: "Test User",
      tier: "PRO"
    }
  });

  console.log("Mock User Created:", user.id);

  console.log("\n--- SIMULATING POST /api/jobs/create ---");
  const job = await prisma.agentJob.create({
    data: {
      userId: user.id,
      jobType: "AI_GENERATION",
      status: "QUEUED",
      payload: {
        platforms: ["twitter", "linkedin"],
        inputText: "Launch announcement for our new AI tool",
      },
    },
  });

  console.log("Job Created (Status 202 Accepted):", job.id);

  console.log("\n--- SIMULATING BACKGROUND WORKER (POST /api/jobs/process) ---");
  const processPayload = JSON.stringify({ jobId: job.id });
  const signature = generateSignature(processPayload);

  console.log("Generated Cryptographic Signature:", signature);
  console.log("Fetching job from queue...");

  const queuedJob = await prisma.agentJob.findUnique({ where: { id: job.id } });

  if (queuedJob?.status === "QUEUED") {
      console.log("Job found. Marking as PROCESSING...");
      await prisma.agentJob.update({
          where: { id: job.id },
          data: { status: "PROCESSING", progress: 10 }
      });

      console.log("Validating Master Model Blueprint with Zod...");
      const mockBlueprint = JSON.stringify({
          platforms: ["twitter", "linkedin"],
          tone: "professional",
          length: "medium"
      });

      // Simulate Schema Validation
      const parsedPlan = JSON.parse(mockBlueprint);
      console.log("Plan Validated:", parsedPlan);

      console.log("Executing Master-Worker Orchestrator...");
      await prisma.agentJob.update({
          where: { id: job.id },
          data: { progress: 60 }
      });

      const mockResult = {
          finalOutputs: {
              twitter: { textContent: "Excited to launch our new AI tool!" },
              linkedin: { textContent: "I am thrilled to announce the launch of our new AI platform." }
          }
      };

      console.log("Execution Complete. Marking as COMPLETED...");
      await prisma.agentJob.update({
          where: { id: job.id },
          data: {
              status: "COMPLETED",
              progress: 100,
              result: mockResult,
              completedAt: new Date()
          }
      });
  }

  console.log("\n--- SIMULATING GET /api/jobs/status ---");
  const finalJob = await prisma.agentJob.findUnique({ where: { id: job.id } });
  console.log("Final Job State:", {
      status: finalJob?.status,
      progress: finalJob?.progress,
      result: finalJob?.result
  });

  // Cleanup
  await prisma.user.delete({ where: { id: user.id } });
  console.log("\nCleanup complete.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
