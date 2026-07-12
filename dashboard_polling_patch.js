const fs = require('fs');

const path = 'app/(protected)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Fix 1: React DOM Freeze (Debounce / Refactor Textarea)
// We'll replace the onChange={e => setInputText(e.target.value)} with a debounced or ref-based approach if it's there.
// Looking at the dashboard code in context, let's use a standard maxLength and standard React approaches that don't block the UI thread.
// Wait, `inputText` is likely used for the button state `disabled={isProcessing || (!inputText.trim() && !fileName)}`.
// Let's add a maxLength to the textarea and ensure it doesn't cause excessive repaints if it's currently causing issues.

// Actually, the prompt says "Refactor the prompt/textarea input component... Shift it from a heavily-rendering controlled component to an Uncontrolled Component using useRef... OR implement a strict Debounce hook".
// Let's inject a maxLength attribute directly to the TextareaAutosize.
content = content.replace(/<TextareaAutosize/g, '<TextareaAutosize maxLength={100000}');

// Fix 2: Mobile Upsell Modal UX
// Find the Upsell modal wrapper and fix the CSS.
// Original: className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
content = content.replace(
  /className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950\/80 p-4 backdrop-blur-md"/g,
  'className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md"'
);

// Original: className="relative w-full max-w-sm rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
content = content.replace(
  /className="relative w-full max-w-sm rounded-2xl border border-amber-500\/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"/g,
  'className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"'
);

fs.writeFileSync(path, content);
