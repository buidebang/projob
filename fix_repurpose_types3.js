const fs = require('fs');
const filePath = 'app/api/repurpose/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
    /tone: tone \|\| undefined,/g,
    "tone: tone ? tone : undefined,"
);

code = code.replace(
    /length: effectiveLength \|\| undefined,/g,
    "length: effectiveLength ? effectiveLength : undefined,"
);

fs.writeFileSync(filePath, code, 'utf8');
