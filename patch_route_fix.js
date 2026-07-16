const fs = require('fs');

let content = fs.readFileSync('app/api/repurpose/route.ts', 'utf-8');

// I duplicated orchestrationMode, let's fix that
content = content.replace(/orchestrationMode: orchestrationMode,\s*orchestrationMode,/g, 'orchestrationMode,');
content = content.replace(/imageRequest,\s*orchestrationMode: orchestrationMode,/g, 'imageRequest,\n      orchestrationMode,');
content = content.replace(/orchestrationMode,\s*orchestrationMode,/g, 'orchestrationMode,');

fs.writeFileSync('app/api/repurpose/route.ts', content);
