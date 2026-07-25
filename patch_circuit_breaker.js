const fs = require('fs');
const file = 'app/api/orchestrator/route.ts';
let code = fs.readFileSync(file, 'utf8');

const search = `            let aiResponseStream;

            if (apiRoutingMode === 'GLOBAL') {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": \`Bearer \${openRouterKey}\`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: targetModel,
                        messages: [{ role: "user", content: workerA_Prompt }],
                        response_format: { type: "json_object" },
                        stream: true
                    })
                });
                if (!response.ok) {
                    const err = await response.text();
                    if (response.status === 429) throw new Error("429");
                    throw new Error(\`OpenRouter Error: \${err}\`);
                }
                aiResponseStream = response.body;

            } else if (targetModel.includes("claude")) {
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "x-api-key": anthropicKey,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        model: targetModel,
                        max_tokens: maxOutputTokensDynamical,
                        messages: [{ role: "user", content: workerA_Prompt }],
                        stream: true
                    })
                });
                if (!response.ok) {
                    if (response.status === 429) throw new Error("429");
                    throw new Error(\`Anthropic Error: \${await response.text()}\`);
                }
                aiResponseStream = response.body;

            } else {
                const genAIWorker = new GoogleGenerativeAI(googleKey);
                const model = genAIWorker.getGenerativeModel({
                    model: targetModel,
                    generationConfig: {
                        responseMimeType: "application/json",
                        maxOutputTokens: maxOutputTokensDynamical
                    }
                });
                const streamResult = await model.generateContentStream(workerA_Prompt);

                const encoder = new TextEncoder();
                aiResponseStream = new ReadableStream({
                    async start(controller) {
                        for await (const chunk of streamResult.stream) {
                            controller.enqueue(encoder.encode(chunk.text()));
                        }
                        controller.close();
                    }
                });
            }`;

const replace = `            let aiResponseStream;
            let retries = 0;
            const max_retries = 2;

            while (retries < max_retries) {
                try {
                    if (apiRoutingMode === 'GLOBAL') {
                        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": \`Bearer \${openRouterKey}\`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                model: targetModel,
                                messages: [{ role: "user", content: workerA_Prompt }],
                                response_format: { type: "json_object" },
                                stream: true
                            })
                        });
                        if (!response.ok) {
                            const err = await response.text();
                            if (response.status === 429) throw new Error("429");
                            throw new Error(\`OpenRouter Error: \${err}\`);
                        }
                        aiResponseStream = response.body;

                    } else if (targetModel.includes("claude")) {
                        const response = await fetch("https://api.anthropic.com/v1/messages", {
                            method: "POST",
                            headers: {
                                "x-api-key": anthropicKey,
                                "anthropic-version": "2023-06-01",
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                model: targetModel,
                                max_tokens: maxOutputTokensDynamical,
                                messages: [{ role: "user", content: workerA_Prompt }],
                                stream: true
                            })
                        });
                        if (!response.ok) {
                            if (response.status === 429) throw new Error("429");
                            throw new Error(\`Anthropic Error: \${await response.text()}\`);
                        }
                        aiResponseStream = response.body;

                    } else {
                        const genAIWorker = new GoogleGenerativeAI(googleKey);
                        const model = genAIWorker.getGenerativeModel({
                            model: targetModel,
                            generationConfig: {
                                responseMimeType: "application/json",
                                maxOutputTokens: maxOutputTokensDynamical
                            }
                        });
                        const streamResult = await model.generateContentStream(workerA_Prompt);

                        const encoder = new TextEncoder();
                        aiResponseStream = new ReadableStream({
                            async start(controller) {
                                for await (const chunk of streamResult.stream) {
                                    controller.enqueue(encoder.encode(chunk.text()));
                                }
                                controller.close();
                            }
                        });
                    }
                    break;
                } catch (err: any) {
                    if (err.message?.includes('429')) throw err;
                    retries++;
                    if (retries >= max_retries) {
                        return NextResponse.json({
                            type: 'directive',
                            memoryAction: 'SUPPORT',
                            message: '<response>Analysis stabilized. Manual intervention may be required for deeper layers.</response>'
                        }, { status: 200 });
                    }
                }
            }`;

if (code.includes(search)) {
    fs.writeFileSync(file, code.replace(search, replace));
    console.log("Patched successfully!");
} else {
    console.error("Search string not found!");
}
