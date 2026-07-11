const fs = require('fs');
const path = 'app/(protected)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const hookPos = content.indexOf('const { data: session, status } = useSession();');
const pollingLogic = `
  // Background Job Polling mechanism
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (activeJobId && isProcessing) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(\`/api/jobs/status?id=\${activeJobId}\`);
          const data = await res.json();

          if (data.status === "COMPLETED") {
            setJobProgress(100);
            setIsProcessing(false);
            setActiveJobId(null);

            // Map results back to UI
            if (data.result && data.result.finalOutputs) {
                const fetchedOutputs = data.result.finalOutputs;
                const mappedOutputs: Record<string, any> = {};

                Object.keys(fetchedOutputs).forEach(key => {
                    mappedOutputs[key] = {
                        textContent: fetchedOutputs[key].textContent,
                        seoScore: 98, // Mock or fetch actual
                        grammarAccuracy: 100
                    };
                });

                setYieldOutput(JSON.stringify(mappedOutputs));
            }

            clearInterval(intervalId);
          } else if (data.status === "FAILED") {
            setIsProcessing(false);
            setActiveJobId(null);
            clearInterval(intervalId);

            if (data.result?.action === "TRIGGER_KASTRA_APPROVAL") {
                setShowKastraModal(true);
            } else {
                console.error(data.result?.error || "Job failed during processing.");
            }
          } else if (data.status === "PROCESSING") {
            setJobProgress(data.progress || 10);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000);
    }

    return () => clearInterval(intervalId);
  }, [activeJobId, isProcessing]);
`;

content = content.slice(0, hookPos + 48) + pollingLogic + content.slice(hookPos + 48);

// Kastra modal markup
const upsellModalPos = content.indexOf('{/* Strategic Conversion Upsell Modal Grid */}');
const kastraModal = `
      {/* Security Action Required Modal (Kastra Guardrails) */}
      <AnimatePresence>
        {showKastraModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-red-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl"
            >
              <div className="flex flex-col gap-3 text-center">
                <AlertTriangle className="mx-auto text-red-500" size={32} />
                <h3 className="text-lg font-black text-slate-100">
                  Security Action Required
                </h3>
                <p className="text-sm text-slate-400">
                  Kastra Guardrail Intercept: High-risk action detected. The Master model blueprint attempted to schedule massive parallel tasks or massive token consumption.
                  Automation is entirely suspended.
                </p>
                <button
                  onClick={() => setShowKastraModal(false)}
                  className="mt-4 w-full rounded-xl bg-red-600 p-3 text-xs font-black text-slate-100 shadow-xl shadow-red-500/20 transition-transform hover:bg-red-500"
                >
                  APPROVE (Admin Only)
                </button>
                <button
                  onClick={() => setShowKastraModal(false)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-xs font-black text-slate-400 transition-transform hover:bg-slate-800"
                >
                  CANCEL JOB
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

content = content.slice(0, upsellModalPos) + kastraModal + content.slice(upsellModalPos);


// Add progress indicator to the UI
const buttonPos = content.indexOf('<ArrowUp');
const progressUi = `
                  {activeJobId ? (
                      <div className="absolute inset-x-2 -top-12 rounded border border-slate-700 bg-slate-900 p-2 text-center text-[10px] text-slate-300 shadow">
                         Background Job Processing: {jobProgress}%
                         <div className="mt-1 h-1 w-full overflow-hidden rounded bg-slate-800">
                             <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: \`\${jobProgress}%\` }} />
                         </div>
                      </div>
                  ) : null}
`;

content = content.slice(0, buttonPos - 1) + progressUi + content.slice(buttonPos - 1);

fs.writeFileSync(path, content, 'utf8');
