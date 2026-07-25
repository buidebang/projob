const fs = require('fs');

const filePath = 'lib/cognitive-vault/prompt-weaver.ts';
let code = fs.readFileSync(filePath, 'utf8');

const freeGuestConstraint = `\nYou are operating under a strict token limit. You MUST keep <thoughts> extremely brief (under 3 sentences). You MUST deliver a highly compressed, concise, yet 100% accurate <response>. Do not generate long lists. Ensure all JSON/XML tags are properly closed.`;

const premiumConstraint = `\nUse extensive, deep Chain-of-Thought in <thoughts> and deliver extremely dense, exhaustive <response> outputs.`;

// We inject the constraints where tier is checked.
// In the code:
/*
    if (tier === "FREE" || tier === "GUEST") {
        wovenPrompt = minifyText(combined);
        // Smart truncation: avoid cutting tags mid-way by finding the last proper boundary
*/

code = code.replace(
    /if\s*\(tier\s*===\s*"FREE"\s*\|\|\s*tier\s*===\s*"GUEST"\)\s*\{/,
    `if (tier === "FREE" || tier === "GUEST") {\n        combined += \`${freeGuestConstraint}\`;`
);

code = code.replace(
    /\} else \{\n\s*\/\/\s*Premium:\s*no\s*minification,\s*max\s*context\n\s*wovenPrompt\s*=\s*combined;/,
    `} else {\n        combined += \`${premiumConstraint}\`;\n        // Premium: no minification, max context\n        wovenPrompt = combined;`
);

fs.writeFileSync(filePath, code, 'utf8');
