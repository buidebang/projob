const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DeepSearchEngine {
  /**
   * Scrapes a URL using Jina AI Reader and returns the extracted Markdown.
   * Enforces Pre-Processing Chunking Logic to return only the "Highest Entropy Payload" (first 8000 characters)
   * to protect token limits.
   */
  public static async execute(url: string, retries = 3, baseDelay = 1000): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Scraper API returned HTTP status ${response.status}`);
        }

        const rawMarkdown = await response.text();

        // Pre-Processing Chunking Logic: extract the Highest Entropy Payload
        const MAX_LENGTH = 8000;
        let payload = rawMarkdown;
        if (payload.length > MAX_LENGTH) {
          payload = payload.substring(0, MAX_LENGTH);
        }

        return payload;
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (attempt === retries) {
          console.error('[Deep Search Engine Error Final]:', err);
          throw new Error(`Deep Search failed after ${retries} attempts: ${err.message}`);
        }

        console.warn(`[Deep Search Engine Warning]: Attempt ${attempt} failed, retrying...`, err.message);

        // Exponential backoff
        await wait(baseDelay * Math.pow(2, attempt - 1));
      }
    }

    throw new Error('Deep Search failed unexpectedly');
  }
}
