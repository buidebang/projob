import { Redis } from 'ioredis';
import * as Y from 'yjs';

export class RedisPersistence {
  private redis: Redis;
  private pub: Redis;
  private sub: Redis;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.redis = new Redis(redisUrl);
    this.pub = new Redis(redisUrl);
    this.sub = new Redis(redisUrl);
  }

  async bindState(docName: string, doc: Y.Doc) {
    // 1. Reconstruct from Redis binary blob
    const updates = await this.redis.lrangeBuffer(`yjs:updates:${docName}`, 0, -1);
    const baseBuffer = await this.redis.getBuffer(`yjs:doc:${docName}`);

    if (baseBuffer) {
      Y.applyUpdate(doc, new Uint8Array(baseBuffer));
    }

    for (const update of updates) {
      Y.applyUpdate(doc, new Uint8Array(update));
    }

    // Subscribe to external pod changes
    await this.sub.subscribe(`yjs:pubsub:${docName}`);
    this.sub.on('messageBuffer', (channel, message) => {
      if (channel.toString() === `yjs:pubsub:${docName}`) {
        Y.applyUpdate(doc, new Uint8Array(message), this);
      }
    });

    // Write incremental updates
    doc.on('update', async (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        const buffer = Buffer.from(update);
        await (this.pub as any).publishBuffer(`yjs:pubsub:${docName}`, buffer);
        await (this.redis as any).rpushBuffer(`yjs:updates:${docName}`, buffer);
      }
    });
  }

  async close() {
    await this.sub.quit();
    await this.pub.quit();
    await this.redis.quit();
  }
}
