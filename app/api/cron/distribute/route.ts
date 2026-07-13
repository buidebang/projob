import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PostStatus, TelemetryPhase } from "@prisma/client";
import { DistributionSensor } from "@/lib/telemetry/distribution_sensor";

const prisma = new PrismaClient();
const sensor = new DistributionSensor();

export async function GET(req: NextRequest) {
  // Optional: add authorization token check for the cron job
  // to ensure only authorized callers can run it.

  try {
    // 1. Fetch a batch (e.g., 5) of PENDING or BACKOFF posts where scheduledFor <= now()
    const now = new Date();
    const posts = await prisma.scheduledPost.findMany({
      where: {
        status: { in: [PostStatus.PENDING, PostStatus.BACKOFF] },
        scheduledFor: { lte: now }
      },
      take: 5
    });

    if (posts.length === 0) {
      return NextResponse.json({ message: "No posts to distribute." }, { status: 200 });
    }

    const results: Array<{ id: string; status: string }> = [];

    for (const post of posts) {
      // 2. Pre-flight
      const isHealthy = await sensor.preFlightCheck(post);

      if (!isHealthy) {
        results.push({ id: post.id, status: 'FAILED_PRE_FLIGHT' });
        continue; // The sensor already logs this and updates DB state to FAILED
      }

      // 3. Simulate outbound API request
      const startTime = Date.now();

      // We'll simulate a 429 response if the content contains "[SIMULATE_429]"
      const simulate429 = post.content.includes("[SIMULATE_429]");

      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 50));

      const endTime = Date.now();
      const executionTimeMs = endTime - startTime;

      if (simulate429) {
        // 4. Handle 429 Rate Limit
        const attempt = 1; // In a real scenario we'd track attempts, here we simplify
        const backoffMs = sensor.calculateBackoff(attempt);
        const newScheduledFor = new Date(Date.now() + backoffMs);

        await sensor.recordTelemetry(post.id, TelemetryPhase.NETWORK, {
          status: 'BACKOFF',
          httpStatusCode: 429,
          executionTimeMs,
          backoffAppliedMs: backoffMs
        });

        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: PostStatus.BACKOFF,
            scheduledFor: newScheduledFor
          }
        });

        results.push({ id: post.id, status: 'BACKOFF' });

        // Exact token cost refund
        const refundCost = 100; // Mock calculation, in real scenario base it on tokens
        await prisma.user.update({
          where: { id: post.userId },
          data: { credits: { increment: refundCost } }
        });
      } else {
        // Handle Success
        await sensor.recordTelemetry(post.id, TelemetryPhase.NETWORK, {
          status: 'SUCCESS',
          httpStatusCode: 200,
          executionTimeMs
        });

        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: PostStatus.SUCCESS }
        });

        results.push({ id: post.id, status: 'SUCCESS' });
      }
    }

    return NextResponse.json({ processed: results.length, results }, { status: 200 });

  } catch (error) {
    console.error("Distribution Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
