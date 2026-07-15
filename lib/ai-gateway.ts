import { AIModelType } from '@prisma/client';
import { getSystemConfig } from '@/lib/db';

export interface AIServicePayload {
  modelName: string;
  modelEnum: AIModelType;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: { type: 'json_object' };
  temperature?: number;
}

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
    payload.userPrompt = TokenCompressor.compress(payload.userPrompt);

    // Bypass Next.js unstable_cache if running outside of Next environment
    let config;
    try {
        config = await getSystemConfig();
    } catch(e) {
        // Fallback for raw node execution in stage 3/4 tests
        config = {
            active_ai_provider: process.env.MOCK_PROVIDER || 'OPENROUTER',
            direct_api_key: process.env.GEMINI_API_KEY,
            ai_base_url: process.env.MOCK_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions'
        };
    }


    const isProviderOpenRouter = config.active_ai_provider === 'OPENROUTER';
    let activeApiKey = isProviderOpenRouter ? config.openrouter_api_key : config.direct_api_key;

    // Override modelName if admin explicitly set a target model ID in Universal Gateway config
    const targetModelId = config.isEmergencyMode ? config.fallbackModelName : (config.ai_target_model_id || payload.modelName);

    // If emergency mode is active, override keys
    if (config.isEmergencyMode && config.fallbackApiKeys && config.fallbackApiKeys.length > 0) {
      activeApiKey = config.fallbackApiKeys[0];
    }

    const baseURL = config.ai_base_url || 'https://openrouter.ai/api/v1/chat/completions';

    // The Omni-Adapter: Check Auth Header Type (Bearer vs x-api-key vs none)
    // We default to Bearer, or x-api-key if the URL matches certain patterns like Google API
    // Use admin-configured fields for the Universal Gateway
    const authHeaderType = config.ai_auth_header_type || (baseURL.includes('googleapis.com') ? 'x-goog-api-key' : 'Authorization');
    const authHeaderValue = authHeaderType === 'Authorization' ? `Bearer ${activeApiKey}` : activeApiKey;



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
      'Content-Type': 'application/json',
    };
    if (authHeaderType === 'Authorization') {
        headers['Authorization'] = authHeaderValue;
    } else {
        headers[authHeaderType] = authHeaderValue;
    }

    if (isProviderOpenRouter) {
      headers['HTTP-Referer'] = 'https://monicaomni.ai';
      headers['X-Title'] = 'MONICA_OMNI Core Layer';
    }

    // Dynamic Payload Mapping based on Provider
    let fetchBody: any = {};
    const isGoogleNative = baseURL.includes('generativelanguage.googleapis.com');

    if (isGoogleNative) {
        // Map to Google Native (Gemini) format
        fetchBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: payload.systemPrompt + "\n\n" + payload.userPrompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: payload.temperature ?? 0.75,
                maxOutputTokens: 4500,
                // Note: Google uses different JSON mode flags if responseFormat is set, handling minimally here
            }
        };
        // Add query param if activeApiKey isn't passed in header for some google endpoints
        // actually x-goog-api-key is standard.
    } else {
        // Map to standard OpenAI/OpenRouter format
        fetchBody = {
            model: targetModelId,
            messages: [
              { role: 'system', content: payload.systemPrompt },
              { role: 'user', content: payload.userPrompt }
            ],
            response_format: payload.responseFormat || { type: 'json_object' },
            temperature: payload.temperature ?? 0.75,
            max_tokens: 4500
        };
    }


    const maxRetries = 3;
    const baseDelay = 1000;

    let activeHeaders = { ...headers };
    let currentKeyIndex = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(baseURL, {
          method: 'POST',
          headers: activeHeaders,
          body: JSON.stringify(fetchBody),
        });

        if (!response.ok) {

          if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {

            // EMERGENCY MODE: Intelligent Key Rotation Load Balancing
            if (response.status === 429 && config.isEmergencyMode && config.fallbackApiKeys && config.fallbackApiKeys.length > 1) {
              currentKeyIndex = (currentKeyIndex + 1) % config.fallbackApiKeys.length;
              activeApiKey = config.fallbackApiKeys[currentKeyIndex];
              const newAuthValue = authHeaderType === 'Authorization' ? `Bearer ${activeApiKey}` : activeApiKey;

              if (authHeaderType === 'Authorization') {
                  activeHeaders['Authorization'] = newAuthValue;
              } else {
                  activeHeaders[authHeaderType] = newAuthValue;
              }
              console.warn(`[Emergency Key Rotation]: Switching to key index ${currentKeyIndex} due to 429 Error.`);
              // instantly retry with new key instead of waiting massive backoff, but small jitter
              await new Promise(res => setTimeout(res, 500));
              continue; // try again with new key
            }

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

        let content = '';
        let promptTokens = 1000;
        let completionTokens = 1500;

        if (isGoogleNative) {
            content = responseData.candidates[0].content.parts[0].text;
            promptTokens = responseData.usageMetadata?.promptTokenCount || promptTokens;
            completionTokens = responseData.usageMetadata?.candidatesTokenCount || completionTokens;
        } else {
            content = responseData.choices[0].message.content;
            promptTokens = responseData.usage?.prompt_tokens || promptTokens;
            completionTokens = responseData.usage?.completion_tokens || completionTokens;
        }

        return {
          rawContent: content,
          inputTokens: promptTokens,
          outputTokens: completionTokens
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
