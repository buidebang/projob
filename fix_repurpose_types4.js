const fs = require('fs');
const filePath = 'app/api/repurpose/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
    /tone: tone \? tone : undefined,/g,
    "tone: tone ? tone : \"\","
);

code = code.replace(
    /length: effectiveLength \? effectiveLength : undefined,/g,
    "length: effectiveLength ? effectiveLength : \"\","
);

code = code.replace(
    /flashMode,/g,
    "flashMode: flashMode ? \"true\" : \"false\","
);

fs.writeFileSync(filePath, code, 'utf8');
