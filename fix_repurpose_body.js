const fs = require('fs');
const filePath = 'app/api/repurpose/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// There is a reference to `body.platforms` at line 230
code = code.replace(/body\.platforms/g, 'platforms');

fs.writeFileSync(filePath, code, 'utf8');
