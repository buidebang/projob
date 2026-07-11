const fs = require('fs');
const path = 'app/api/jobs/status/route.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('export const dynamic = "force-dynamic";')) {
    content = 'export const dynamic = "force-dynamic";\n' + content;
}
fs.writeFileSync(path, content, 'utf8');
