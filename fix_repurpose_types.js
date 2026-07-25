const fs = require('fs');
const filePath = 'app/api/repurpose/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// The errors in repurpose/route.ts:
// app/api/repurpose/route.ts(262,9): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
// app/api/repurpose/route.ts(263,9): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
// app/api/repurpose/route.ts(267,9): error TS2322: Type 'boolean' is not assignable to type 'string'.

// These correspond to the ProcessingOrchestrator.orchestrate parameters:
// tone, length, flashMode (wait, flashMode is boolean in interface, length is string, searchDepth is string).

code = code.replace(
    /tone,\s*length: effectiveLength,\s*flashMode,/g,
    \`tone: tone || undefined,
        length: effectiveLength || undefined,
        flashMode,\`
);

fs.writeFileSync(filePath, code, 'utf8');
