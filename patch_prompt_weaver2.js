const fs = require('fs');
const file = 'lib/cognitive-vault/prompt-weaver.ts';
let code = fs.readFileSync(file, 'utf8');

const search = `    if (tier === "FREE" || tier === "GUEST") {
        combined += \`
You are operating under a strict token limit. You MUST keep <thoughts> extremely brief (under 3 sentences). You MUST deliver a highly compressed, concise, yet 100% accurate <response>. Do not generate long lists. Ensure all JSON/XML tags are properly closed.\`;
        wovenPrompt = minifyText(combined);`;

const replace = `    if (tier === "FREE" || tier === "GUEST") {
        combined += \`
You are operating under a strict token limit. You MUST keep <thoughts> extremely brief (under 3 sentences). You MUST deliver a highly compressed, concise, yet 100% accurate <response>. Do not generate long lists. Ensure all JSON/XML tags are properly closed. You are under severe token constraints. Bypass all reasoning commentary. You MUST compress your response into the absolute highest density of factual/functional output. Provide only the finalized code/solution.\`;
        wovenPrompt = minifyText(combined);`;

if (code.includes(search)) {
    fs.writeFileSync(file, code.replace(search, replace));
    console.log("Patched successfully!");
} else {
    console.error("Search string not found!");
}
