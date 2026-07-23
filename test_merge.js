const fs = require('fs');

let content = fs.readFileSync('app/api/orchestrator/route.ts', 'utf8');

// 1. Add crypto import if missing
if (!content.includes('import { decrypt }')) {
    content = content.replace(
        "import { weavePrompt } from '@/lib/cognitive-vault/prompt-weaver';",
        "import { weavePrompt } from '@/lib/cognitive-vault/prompt-weaver';\nimport { decrypt } from '@/lib/crypto';"
    );
}

// 2. Remove hardcoded genAI
content = content.replace(
    '// Initialize the Google Generative AI SDK with the live API key provided\nconst genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");\n',
    ''
);

// 3. Inject config fetch right inside POST
const oldStartPost = `        if (!prompt) {
            return NextResponse.json({ success: true, routed: true }, { status: 200 });
        }`;

const newStartPost = `        if (!prompt) {
            return NextResponse.json({ success: true, routed: true }, { status: 200 });
        }

        const sysConfig = await prisma.systemConfig.findUnique({
            where: { id: "CURRENT_GLOBAL_CONFIG" }
        });
        const openRouterKey = sysConfig?.global_aggregator_key ? decrypt(sysConfig.global_aggregator_key) : (process.env.OPENROUTER_API_KEY || "");
        const googleKey = sysConfig?.provider_google_key ? decrypt(sysConfig.provider_google_key) : (process.env.GEMINI_API_KEY || "");
        const anthropicKey = sysConfig?.provider_anthropic_key ? decrypt(sysConfig.provider_anthropic_key) : "";
        const deepseekKey = sysConfig?.provider_deepseek_key ? decrypt(sysConfig.provider_deepseek_key) : "";
        const apiRoutingMode = sysConfig?.api_routing_mode || "GLOBAL";
`;
content = content.replace(oldStartPost, newStartPost);

// 4. Update the classify intent genAI instance
content = content.replace(
    '            const model = genAI.getGenerativeModel({',
    '            const genAIForClassify = new GoogleGenerativeAI(googleKey);\n            const model = genAIForClassify.getGenerativeModel({'
);

// 5. Replace multi-agent execution block with multiplexer ONLY EXACT MATCHES
const replaceStr = `        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 8192 // Prevent Output Truncation
                }
            });

            const workerA_Prompt = \`You are Worker A, optimized for execution speed and minimal token overhead. Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;
            const workerB_Prompt = \`You are Worker B, optimized for zero-regression security and edge-case interception (e.g., database rollbacks, rate limits). Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;
            const workerC_Prompt = \`You are Worker C, optimized for clean architectural abstraction. Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;

            const [resA, resB, resC] = await Promise.all([
                model.generateContent(workerA_Prompt),
                model.generateContent(workerB_Prompt),
                model.generateContent(workerC_Prompt)
            ]);

            workerA_Result = safeParseXML(resA.response.text());
            workerB_Result = safeParseXML(resB.response.text());
            workerC_Result = safeParseXML(resC.response.text());`;


const multiplexerLogic = `        try {
            const workerA_Prompt = \`You are Worker A, optimized for execution speed and minimal token overhead. Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;
            const workerB_Prompt = \`You are Worker B, optimized for zero-regression security and edge-case interception (e.g., database rollbacks, rate limits). Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;
            const workerC_Prompt = \`You are Worker C, optimized for clean architectural abstraction. Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;

            const getTargetModel = () => {
                const matrix = sysConfig?.commercial_tier_matrix as any;
                const tier = sub?.activeTier?.toLowerCase() || 'free';
                return matrix?.models?.[tier] || "gemini-1.5-flash";
            };
            const targetModel = getTargetModel();

            if (apiRoutingMode === 'GLOBAL') {
                const callOpenRouter = async (promptText: string) => {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": \`Bearer \${openRouterKey}\`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: targetModel,
                            messages: [{ role: "user", content: promptText }],
                            response_format: { type: "json_object" }
                        })
                    });
                    if (!response.ok) {
                        const err = await response.text();
                        if (response.status === 429) throw new Error("429");
                        throw new Error(\`OpenRouter Error: \${err}\`);
                    }
                    const data = await response.json();
                    return data.choices[0].message.content;
                };

                const [resA_txt, resB_txt, resC_txt] = await Promise.all([
                    callOpenRouter(workerA_Prompt),
                    callOpenRouter(workerB_Prompt),
                    callOpenRouter(workerC_Prompt)
                ]);

                workerA_Result = safeParseXML(resA_txt);
                workerB_Result = safeParseXML(resB_txt);
                workerC_Result = safeParseXML(resC_txt);

            } else {
                if (targetModel.includes("claude")) {
                     const callAnthropic = async (promptText: string) => {
                        const response = await fetch("https://api.anthropic.com/v1/messages", {
                            method: "POST",
                            headers: {
                                "x-api-key": anthropicKey,
                                "anthropic-version": "2023-06-01",
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                model: targetModel,
                                max_tokens: 8192,
                                messages: [{ role: "user", content: promptText }]
                            })
                        });
                        if (!response.ok) {
                            if (response.status === 429) throw new Error("429");
                            throw new Error(\`Anthropic Error: \${await response.text()}\`);
                        }
                        const data = await response.json();
                        return data.content[0].text;
                     };

                     const [resA_txt, resB_txt, resC_txt] = await Promise.all([
                         callAnthropic(workerA_Prompt),
                         callAnthropic(workerB_Prompt),
                         callAnthropic(workerC_Prompt)
                     ]);

                     workerA_Result = safeParseXML(resA_txt);
                     workerB_Result = safeParseXML(resB_txt);
                     workerC_Result = safeParseXML(resC_txt);

                } else {
                     const genAIWorker = new GoogleGenerativeAI(googleKey);
                     const model = genAIWorker.getGenerativeModel({
                         model: targetModel,
                         generationConfig: {
                             responseMimeType: "application/json",
                             maxOutputTokens: 8192
                         }
                     });

                     const [a, b, c] = await Promise.all([
                         model.generateContent(workerA_Prompt),
                         model.generateContent(workerB_Prompt),
                         model.generateContent(workerC_Prompt)
                     ]);

                     workerA_Result = safeParseXML(a.response.text());
                     workerB_Result = safeParseXML(b.response.text());
                     workerC_Result = safeParseXML(c.response.text());
                }
            }`;

if (content.includes(replaceStr)) {
    content = content.replace(replaceStr, multiplexerLogic);
    fs.writeFileSync('app/api/orchestrator/route.ts', content);
    console.log("Replaced multi-agent logic successfully.");
} else {
    console.log("Could not find the exact string to replace in route.ts");
}
