const fs = require('fs');

let code = fs.readFileSync('app/api/orchestrator/route.ts', 'utf8');

code = code.replace(
    /const workerA_Prompt = `You are Worker A, optimized for execution speed and minimal token overhead\. Analyze this directive and output a JSON execution plan with 'toolExecutions' \(array of \{name, args\}\), 'memoryAction' \('SUPERSEDE' or 'SUPPORT'\), and 'message'\. Directive: \$\{prompt\}`;/g,
    `const workerA_Prompt = \`You are Worker A, optimized for execution speed and minimal token overhead. Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;`
);

code = code.replace(
    /const workerB_Prompt = `You are Worker B, optimized for zero-regression security and edge-case interception \(e\.g\., database rollbacks, rate limits\)\. Analyze this directive and output a JSON execution plan with 'toolExecutions' \(array of \{name, args\}\), 'memoryAction' \('SUPERSEDE' or 'SUPPORT'\), and 'message'\. Directive: \$\{prompt\}`;/g,
    `const workerB_Prompt = \`You are Worker B, optimized for zero-regression security and edge-case interception (e.g., database rollbacks, rate limits). Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;`
);

code = code.replace(
    /const workerC_Prompt = `You are Worker C, optimized for clean architectural abstraction\. Analyze this directive and output a JSON execution plan with 'toolExecutions' \(array of \{name, args\}\), 'memoryAction' \('SUPERSEDE' or 'SUPPORT'\), and 'message'\. Directive: \$\{prompt\}`;/g,
    `const workerC_Prompt = \`You are Worker C, optimized for clean architectural abstraction. Analyze this directive and output a JSON execution plan with 'toolExecutions' (array of {name, args}), 'memoryAction' ('SUPERSEDE' or 'SUPPORT'), and 'message'. Directive: \${enrichedPrompt}\`;`
);

fs.writeFileSync('app/api/orchestrator/route.ts', code);
