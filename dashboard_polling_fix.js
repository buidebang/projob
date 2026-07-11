const fs = require('fs');
const path = 'app/(protected)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix scope and variable declarations
const useSWRpos = content.indexOf('import useSWR from "swr";');
const effectBlockStart = content.indexOf('// Background Job Polling mechanism');
const effectBlockEnd = content.indexOf('  // Unified Flow State Controls');

const effectBlock = content.slice(effectBlockStart, effectBlockEnd);
content = content.replace(effectBlock, '');

const returnPos = content.indexOf('const handleExecuteOrchestration = async () => {');
content = content.slice(0, returnPos) + effectBlock + '\n' + content.slice(returnPos);

content = content.replace('selectedTone', '"professional"');
content = content.replace('selectedLength', '"medium"');
content = content.replace('isFlashMode', 'false');

content = content.replace('setSelectedPlatform(', 'setSelectedPlatforms([');

fs.writeFileSync(path, content, 'utf8');
