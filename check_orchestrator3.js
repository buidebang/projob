const fs = require('fs');
const filePath = 'app/api/orchestrator/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

const diff = `<<<<<<< SEARCH
        if (!isMocked) {
            // Audit Arbitrator: Code Uncertainty Entropy & Human Handoff (The Fail-Safe)
            const aTools = JSON.stringify(workerA_Result.toolExecutions || []);
            const bTools = JSON.stringify(workerB_Result.toolExecutions || []);
            const cTools = JSON.stringify(workerC_Result.toolExecutions || []);

            // Calculate divergence between the 3 parallel workers
            const entropy = (aTools === bTools && bTools === cTools) ? 0 :
                            (aTools === bTools || aTools === cTools || bTools === cTools) ? 0.5 : 1.0;

            if (entropy > 0.5) {
                 // High uncertainty detected, trigger Human Handoff
                 return NextResponse.json({
                     requires_human_handoff: true,
                     message: "Differential analysis yielded high architectural uncertainty. I require human validation on the following edge-case..."
                 }, { status: 200 });
            }

            // Synthesize the final payload (Prioritize Worker B for security)
            const synthesizedPayload = workerB_Result;

            if (synthesizedPayload.message) {
                // Robust XML Regex Fallback Parser for missing closing tags
                const responseMatch = synthesizedPayload.message.match(/<response>([\\s\\S]*?)(?:<\\/response>|$)/i);
                if (responseMatch) {
                    synthesizedPayload.message = responseMatch[1].trim();
                } else {
                    // Salvage the remaining text outside <thoughts> tag if no response tag exists
                    synthesizedPayload.message = synthesizedPayload.message
                        .replace(/<thoughts>[\\s\\S]*?(?:<\\/thoughts>|$)/gi, "")
                        .replace(/<call>[\\s\\S]*?(?:<\\/call>|$)/gi, "")
                        .trim();
                }
            }

            // Autonomous Edge-Case Management (Vertical Resolution)
            if (synthesizedPayload.toolExecutions && Array.isArray(synthesizedPayload.toolExecutions)) {
                 synthesizedPayload.toolExecutions = synthesizedPayload.toolExecutions.map((tool: any) => {
                     if (tool.name === 'mcp_social_publish') {
                          // Handle 429 Too Many Requests natively
                          tool.backoffAlgorithm = "exponential_with_jitter";
                          tool.maxRetries = 5;
                     }
                     if (tool.name === 'mcp_web3_analyze' || tool.name.includes('mutate')) {
                          // Preemptively include timeline-based state reconciliation
                          tool.stateReconciliation = "timeline_based_reconciliation";
                          tool.rollbackSafe = true;
                     }
                     return tool;
                 });
            }

            // The "Scar-Tissue" Memory Compiler (Graphiti & Hindsight)
            const scarTissueDocument = \`Vibe-Engineering Synthesis: Worker A (Speed), Worker B (Security), Worker C (Architecture). Divergence Entropy: \${entropy}. Decided Tools: \${bTools}. Strategy: \${synthesizedPayload.memoryAction}.\`;
            const t_v = new Date();
            const t_t = new Date();

            // Execute Prisma database write to MemoryNode
            await prisma.memoryNode.create({
                data: {
                    userId: targetUser.id,
                    domainCategory: "ARCHITECTURE",
                    network: "OBSERVATION",
                    content: scarTissueDocument,
                    validTime: t_v,
                    transactionTime: t_t,
                    confidenceScore: 1.0 - entropy,
                    metadata: { action: synthesizedPayload.memoryAction, source: usedSource }
                }
            });

            return NextResponse.json({
                type: 'directive',
                memoryAction: synthesizedPayload.memoryAction || 'SUPERSEDE',
                toolExecutions: synthesizedPayload.toolExecutions || [],
                message: synthesizedPayload.message || "Vibe-Engineering synthesis completed flawlessly."
            }, { status: 200 });
        }

    } catch (error: any) {
=======
        // isMocked and related entropy checks removed since Worker A is immediately streamed.

    } catch (error: any) {
>>>>>>> REPLACE`;

const searchStr = diff.split('<<<<<<< SEARCH\n')[1].split('\n=======\n')[0];
const replaceStr = diff.split('\n=======\n')[1].split('\n>>>>>>> REPLACE')[0];

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
} else {
    // try removing double escapes
    const searchStr2 = searchStr.replace(/\\\\/g, '\\');
    if (code.includes(searchStr2)) {
         code = code.replace(searchStr2, replaceStr);
    } else {
         console.log("Could not find block 3 either");
    }
}
fs.writeFileSync(filePath, code, 'utf8');
