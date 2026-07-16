const fs = require('fs');

let content = fs.readFileSync('app/api/repurpose/route.ts', 'utf-8');

if (!content.includes('orchestrationMode,')) {
    content = content.replace('imageRequest,', 'imageRequest,\n      orchestrationMode,');
}

if (!content.includes('orchestrationMode: orchestrationMode,')) {
    content = content.replace('imageRequest,', 'imageRequest,\n        orchestrationMode: orchestrationMode,');
}

fs.writeFileSync('app/api/repurpose/route.ts', content);
