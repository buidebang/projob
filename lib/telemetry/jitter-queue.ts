export class JitterQueue {
  public static async executeWithBackoff<T>(
    task: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await task();
      } catch (err: any) {
        if (attempt === maxRetries) {
          throw err;
        }

        // Check for 429 Rate Limit
        if (err.message && err.message.includes("429") || (err.status && err.status === 429)) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.warn(`[JitterQueue]: Rate limit hit. Backing off for ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          throw err; // Only retry on rate limits or specific transient errors
        }
      }
    }
    throw new Error("JitterQueue: Max retries exceeded");
  }
}
