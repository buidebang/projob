const fs = require('fs');
const path = 'app/(protected)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const endAsyncHandoffPos = content.indexOf('// End Async Handoff');
const catchPos = content.indexOf('} catch (err: any) {', endAsyncHandoffPos);

if (endAsyncHandoffPos > -1 && catchPos > -1) {
   content = content.slice(0, endAsyncHandoffPos + 20) + '\n' + content.slice(catchPos);
}
fs.writeFileSync(path, content, 'utf8');
