const fs = require('fs');
const filePath = 'app/api/orchestrator/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

const diff = `<<<<<<< SEARCH
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
                                max_tokens: maxOutputTokensDynamical,
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
                             maxOutputTokens: maxOutputTokensDynamical
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
            }

        } catch (e: any) {
=======
            const backgroundTask = async () => {
                try {
                    let b_txt, c_txt;
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
                            if (!response.ok) return "{}";
                            const data = await response.json();
                            return data.choices[0].message.content;
                        };
                        [b_txt, c_txt] = await Promise.all([
                            callOpenRouter(workerB_Prompt),
                            callOpenRouter(workerC_Prompt)
                        ]);
                    } else if (targetModel.includes("claude")) {
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
                                    max_tokens: maxOutputTokensDynamical,
                                    messages: [{ role: "user", content: promptText }]
                                })
                            });
                            if (!response.ok) return "{}";
                            const data = await response.json();
                            return data.content[0].text;
                        };
                        [b_txt, c_txt] = await Promise.all([
                            callAnthropic(workerB_Prompt),
                            callAnthropic(workerC_Prompt)
                        ]);
                    } else {
                        const genAIWorker = new GoogleGenerativeAI(googleKey);
                        const model = genAIWorker.getGenerativeModel({
                            model: targetModel,
                            generationConfig: {
                                responseMimeType: "application/json",
                                maxOutputTokens: maxOutputTokensDynamical
                            }
                        });
                        const [b, c] = await Promise.all([
                            model.generateContent(workerB_Prompt),
                            model.generateContent(workerC_Prompt)
                        ]);
                        b_txt = b.response.text();
                        c_txt = c.response.text();
                    }

                    const workerB_Result = safeParseXML(b_txt);
                    const scarTissueDocument = \`Vibe-Engineering Synthesis (Async): Worker B (Security), Worker C (Architecture). Decided Tools: \${JSON.stringify(workerB_Result.toolExecutions || [])}. Strategy: \${workerB_Result.memoryAction}.\`;

                    await prisma.memoryNode.create({
                        data: {
                            userId: targetUser.id,
                            domainCategory: "ARCHITECTURE",
                            network: "OBSERVATION",
                            content: scarTissueDocument,
                            validTime: new Date(),
                            transactionTime: new Date(),
                            confidenceScore: 0.9,
                            metadata: { action: workerB_Result.memoryAction, source: usedSource }
                        }
                    });
                } catch (err) {
                    console.error("Background Worker B/C Failed:", err);
                }
            };

            // Start background tasks without blocking
            backgroundTask();

            // Stream Worker A using Standard Web Streams API
            let aiResponseStream;

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

            return new Response(aiResponseStream, {
                headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
            });

        } catch (e: any) {
>>>>>>> REPLACE`;

const searchStr = diff.split('<<<<<<< SEARCH\n')[1].split('\n=======\n')[0];
const replaceStr = diff.split('\n=======\n')[1].split('\n>>>>>>> REPLACE')[0];

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
} else {
    console.log("Could not find search block");
}

fs.writeFileSync(filePath, code, 'utf8');
