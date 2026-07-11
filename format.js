const fs = require('fs');
const path = 'app/(protected)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('min-h-screen bg-[#020617] text-slate-100 font-sans flex overflow-hidden selection:bg-cyan-500/20', 'flex min-h-screen overflow-hidden bg-[#020617] font-sans text-slate-100 selection:bg-cyan-500/20');
fs.writeFileSync(path, content, 'utf8');
