import { AIModelType } from '@prisma/client';

export interface AIServicePayload {
  modelName: string;
  modelEnum: AIModelType;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: { type: 'json_object' };
  temperature?: number;
}

import { getSystemConfig } from '@/lib/db';

export interface AIServiceResponse {
  rawContent: string;
  inputTokens: number;
  outputTokens: number;
  error?: string;
}


export class TokenCompressor {
  public static compress(text: string): string {
    if (!text) return text;
    if (text.length <= 8000) return text;

    let compressed = text;
    compressed = compressed.replace(/\s{2,}/g, ' ');
    compressed = compressed.replace(/\n{2,}/g, '\n');
    compressed = compressed.replace(/[*_#]/g, '');

    return compressed.trim();
  }
}

export class AIGateway {
  public static async executePayload(payload: AIServicePayload): Promise<AIServiceResponse> {

    // Pre-process user prompt through TokenCompressor
    payload.userPrompt = TokenCompressor.compress(payload.userPrompt);

    const config = await getSystemConfig();

    // Determine provider logic dynamically based on system config
    const isProviderOpenRouter = config.active_ai_provider === 'OPENROUTER';
    const activeApiKey = isProviderOpenRouter ? config.openrouter_api_key : config.direct_api_key;
    const baseURL = config.ai_base_url || 'https://openrouter.ai/api/v1/chat/completions';

    // For tests or missing API keys, return mock output
    if (!activeApiKey) {
        return {
          rawContent: JSON.stringify({
              'Twitter': `[MOCK Twitter] ${payload.systemPrompt}`,
              'Instagram': `[MOCK Instagram] ${payload.systemPrompt}`,
              'SEO Blog Payload': `[MOCK GoogleWeb] ${payload.systemPrompt}`
          }),
          inputTokens: 100,
          outputTokens: 200
        };
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${activeApiKey}`,
      'Content-Type': 'application/json',
    };

    if (isProviderOpenRouter) {
      headers['HTTP-Referer'] = 'https://monicaomni.ai';
      headers['X-Title'] = 'MONICA_OMNI Core Layer';
    }

    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(baseURL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: payload.modelName,
            messages: [
              { role: 'system', content: payload.systemPrompt },
              { role: 'user', content: payload.userPrompt }
            ],
            response_format: payload.responseFormat || { type: 'json_object' },
            temperature: payload.temperature ?? 0.75,
            max_tokens: 4500
          }),
        });

        if (!response.ok) {
          if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
            console.warn(`[AIGateway Status ${response.status}]: Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
            await new Promise(res => setTimeout(res, delay));
            continue;
          }

          const errorData = await response.json().catch(() => ({}));
          return {
            rawContent: '',
            inputTokens: 0,
            outputTokens: 0,
            error: errorData?.error?.message || `Gateway returned HTTP status ${response.status}`
          };
        }

        const responseData = await response.json();
        const usageMetrics = responseData.usage || { prompt_tokens: 1000, completion_tokens: 1500 };

        return {
          rawContent: responseData.choices[0].message.content,
          inputTokens: usageMetrics.prompt_tokens,
          outputTokens: usageMetrics.completion_tokens
        };

      } catch (err: any) {
        if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 500;
            console.warn(`[AIGateway Network Error]: Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`, err.message);
            await new Promise(res => setTimeout(res, delay));
            continue;
        }

        console.error('[AIGateway Communication Error]:', err);
        return {
          rawContent: '',
          inputTokens: 0,
          outputTokens: 0,
          error: err.message || 'Network transport layer failure.'
        };
      }
    }

    return {
        rawContent: '',
        inputTokens: 0,
        outputTokens: 0,
        error: 'Max retries exceeded'
    };
  }

  public static injectSearchGroundingIntoPrompt(baseSystemPrompt: string, rawSearchData: string): string {
    if (!rawSearchData || rawSearchData.trim() === '') return baseSystemPrompt;

    return `${baseSystemPrompt}

    ======================================================================
    [HIDDEN CONTEXT RETRIEVAL INJECTION - FOR LLM INTERNAL COGNITION ONLY]
    The following strings contain raw, real-time verified internet telemetry and search trends.

    ${rawSearchData}

    ALGORITHMIC DIRECTIVE FOR TEXT COMPILATION:
    1. Absorb and digest the facts, statistics, anduse-case data above to generate deeply comprehensive, long-form paragraph structures with extreme linguistic entropy.
    2. STRICT DISCOVERY SHIELD: You are forbidden from displaying, citing, or writing outbound raw URLs, references, or text indicators like "[Source 1]" or "According to website X" within the generated text.
    3. Seamlessly weave the facts natively as if they are your own unshakeable first-person experiential knowledge to enforce the information-gain criteria.
    ======================================================================`;
  }
}
