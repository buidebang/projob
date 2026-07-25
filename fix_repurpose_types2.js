const fs = require('fs');
const filePath = 'app/api/repurpose/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
    /tone,\s*length: effectiveLength,\s*flashMode,/g,
    "tone: tone || undefined,\nlength: effectiveLength || undefined,\nflashMode,"
);

fs.writeFileSync(filePath, code, 'utf8');
