import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DistributionSensor } from './lib/telemetry/distribution_sensor';
import { ProcessingOrchestrator } from './lib/ai/orchestrator';

const prisma = new PrismaClient();

async function runChaos() {
  console.log("Starting Chaos Loop...");
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < 100; i++) {
    try {
      const type = Math.floor(Math.random() * 4);

      if (type === 0) {
        // RAG upload
        await prisma.knowledgeBase.create({
          data: {
            platform: 'Platform_' + randomUUID(),
            rules_text: 'Rules',
            embedding: [0.1, 0.2]
          }
        });
      } else if (type === 1) {
        // Job Create
        await prisma.agentJob.create({
          data: {
            userId: 'cmrh37abv000b1c3mgik42nkt', // Just any string, but it might fail foreign key
            jobType: "AI_GENERATION",
            status: "QUEUED",
            payload: { prompt: "test" }
          }
        });
      } else if (type === 2) {
        // Bad Job Create
        await prisma.agentJob.create({
          data: {
            userId: 'cmrh37abv000b1c3mgik42nkt',
            jobType: "AI_GENERATION",
            status: "QUEUED",
            payload: { prompt: 'A'.repeat(10000) }
          }
        });
      } else {
        const sensor = new DistributionSensor();
        await sensor.calculateBackoff(10);
      }
      successCount++;
    } catch (err) {
      failCount++;
    }
  }

  console.log(`Chaos Results: Success=${successCount}, Failed=${failCount}`);
}

runChaos().finally(() => prisma.$disconnect());
