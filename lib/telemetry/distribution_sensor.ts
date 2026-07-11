import { PrismaClient, TelemetryPhase, PostStatus, ScheduledPost } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export class DistributionSensor {
  // The Kastra Protocol - evaluate risk of batch action
  public async evaluateRisk(posts: ScheduledPost[]): Promise<ScheduledPost[]> {
    if (posts.length > 5) {
      // High risk batch operation detected
      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          const updated = await prisma.scheduledPost.update({
            where: { id: post.id },
            data: {
              status: PostStatus.PENDING_APPROVAL,
              authorizationRequired: true,
              authorizationToken: randomUUID(),
            },
          });
          return updated;
        })
      );
      return updatedPosts;
    }

    // Check for destructive commands in content (dummy check)
    const destructiveRegex = /DROP TABLE|DELETE FROM|TRUNCATE|DELETE_ALL/i;

    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        if (destructiveRegex.test(post.content)) {
          return await prisma.scheduledPost.update({
            where: { id: post.id },
            data: {
              status: PostStatus.PENDING_APPROVAL,
              authorizationRequired: true,
              authorizationToken: randomUUID(),
            },
          });
        }
        return post;
      })
    );

    return processedPosts;
  }

  // Pre-Flight Health Check
  public async preFlightCheck(post: ScheduledPost): Promise<boolean> {
    let structuralError = '';

    if (post.platform === 'Twitter') {
      if (post.content.length > 280) {
        structuralError = 'Twitter post exceeds 280 characters limit.';
      } else if (/<[a-z][\s\S]*>/i.test(post.content)) {
        structuralError = 'HTML tags are forbidden on Twitter.';
      }
    }

    // You can add logic for other platforms here...

    if (structuralError) {
      // Abort execution, log structural violation, mark FAILED
      await this.recordTelemetry(post.id, TelemetryPhase.PRE_FLIGHT, {
        structuralError,
        status: 'FAILED'
      });

      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: PostStatus.FAILED }
      });
      return false;
    }

    // Success Pre-flight
    await this.recordTelemetry(post.id, TelemetryPhase.PRE_FLIGHT, {
      status: 'SUCCESS'
    });

    return true;
  }

  // Record Telemetry
  public async recordTelemetry(
    postId: string,
    phase: TelemetryPhase,
    metrics: any
  ): Promise<void> {
    await prisma.telemetryLog.create({
      data: {
        postId,
        phase,
        metrics,
      }
    });
  }

  // Calculate Exponential Backoff Time
  public calculateBackoff(attempt: number): number {
    const baseWaitTime = 1000; // 1 second
    const maxWaitTime = 60000; // 60 seconds
    const jitter = Math.random() * 1000; // up to 1 second jitter

    // 2^attempt * baseWaitTime + jitter
    const backoff = Math.min(Math.pow(2, attempt) * baseWaitTime + jitter, maxWaitTime);
    return Math.floor(backoff);
  }
}
