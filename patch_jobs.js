const fs = require('fs');

let content = fs.readFileSync('app/api/jobs/process/route.ts', 'utf-8');

if (!content.includes('orchestrationMode: payload.orchestrationMode')) {
    content = content.replace('maxSearchResults: payload.maxSearchResults || 0,', 'maxSearchResults: payload.maxSearchResults || 0,\n        orchestrationMode: payload.orchestrationMode || "auto",');
}

fs.writeFileSync('app/api/jobs/process/route.ts', content);
