import { PrismaClient } from '@prisma/client';
import { GET } from './app/api/cron/distribute/route';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

async function runSimulation() {
  console.log("--- Starting Zero-Trust Simulation ---");

  // 1. Create a dummy user for the posts
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Simulation User',
    }
  });

  // 2. Inject payloads for Scenarios A, B, and C
  const now = new Date();

  // Scenario A: Perfect Execution
  const postA = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      platform: 'Twitter',
      content: 'This is a perfect execution post.',
      scheduledFor: now,
      status: 'PENDING'
    }
  });

  // Scenario B: Pre-Flight Rejection (500 chars)
  const postB = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      platform: 'Twitter',
      content: 'B'.repeat(500),
      scheduledFor: now,
      status: 'PENDING'
    }
  });

  // Scenario C: Network Turbulence (Simulated 429)
  const postC = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      platform: 'Twitter',
      content: 'This post will fail. [SIMULATE_429]',
      scheduledFor: now,
      status: 'PENDING'
    }
  });

  console.log("Injected 3 Scheduled Posts.");

  // 3. Trigger the Cron logic directly
  console.log("Triggering Event-Driven Publisher...");
  const req = new NextRequest('http://localhost/api/cron/distribute');
  const res = await GET(req);
  const data = await res.json();

  console.log("Publisher Results:", data);

  // 4. Fetch and display Telemetry Logs
  console.log("\n--- Telemetry Logs ---");

  const telemetryB = await prisma.telemetryLog.findMany({
    where: { postId: postB.id }
  });
  console.log("\nScenario B (Pre-Flight Rejection) Telemetry:");
  console.log(JSON.stringify(telemetryB, null, 2));

  const telemetryC = await prisma.telemetryLog.findMany({
    where: { postId: postC.id }
  });
  console.log("\nScenario C (Network Turbulence) Telemetry:");
  console.log(JSON.stringify(telemetryC, null, 2));

  console.log("\n--- Simulation Complete ---");
}

runSimulation()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
