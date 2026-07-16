const fs = require('fs');

let content = fs.readFileSync('app/(protected)/dashboard/page.tsx', 'utf-8');

// 1. Fix jsPDF import
content = content.replace('import jsPDF from "jspdf";', 'import { jsPDF } from "jspdf";');

// 2. Fix CSS Grid for multi-platform outputs
content = content.replace('<div className="flex flex-col gap-6">', '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">');

// 3. Add Orchestration Mode state
if (!content.includes('const [orchestrationMode, setOrchestrationMode] = useState("auto");')) {
    content = content.replace('const [searchDepth, setSearchDepth] = useState("basic");', 'const [searchDepth, setSearchDepth] = useState("basic");\n  const [orchestrationMode, setOrchestrationMode] = useState("auto");');
}

// 4. Update the Config Menu Drawer Overlay
const configMenuReplacement = `<div>
                    <label className="mb-1 block font-mono text-[9px] font-bold uppercase text-slate-500">
                      Orchestration Mode
                    </label>
                    <select
                      value={orchestrationMode}
                      onChange={(e) => setOrchestrationMode(e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 font-mono text-[11px] text-slate-300 focus:outline-none mb-2"
                    >
                      <option value="auto">Auto (Smart Routing)</option>
                      <option value="simple">Simple (Fast)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="heavy">Heavy (Mastermind)</option>
                    </select>
                  </div>
                  <div>`;
content = content.replace('<div>\n                    <label className="mb-1 block font-mono text-[9px] font-bold uppercase text-slate-500">\n                      Compute Layer', configMenuReplacement + '\n                    <label className="mb-1 block font-mono text-[9px] font-bold uppercase text-slate-500">\n                      Compute Layer');

// Pass orchestrationMode to payload
content = content.replace('searchDepth: searchDepth,', 'searchDepth: searchDepth,\n                            orchestrationMode: orchestrationMode,');

fs.writeFileSync('app/(protected)/dashboard/page.tsx', content);
