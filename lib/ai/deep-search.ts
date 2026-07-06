export class DeepSearchEngine {
  /**
   * Scrapes a URL using Jina AI Reader and returns the extracted Markdown.
   * Enforces Pre-Processing Chunking Logic to return only the "Highest Entropy Payload" (first 8000 characters)
   * to protect token limits.
   */
  public static async execute(url: string): Promise<string> {
    try {
      const response = await fetch(`https://r.jina.ai/${url}`);

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
      console.error('[Deep Search Engine Error]:', err);
      throw new Error(`Deep Search failed: ${err.message}`);
    }
  }
}
