const fs = require('fs');
const path = 'app/(protected)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure SWR is imported for polling if not there
if (!content.includes('useSWR')) {
  content = content.replace('import React, { useEffect, useRef, useState } from "react";', 'import React, { useEffect, useRef, useState } from "react";\nimport useSWR from "swr";');
}

// Add state for tracking jobs inside Dashboard component
const stateHookPos = content.indexOf('const [isProcessing, setIsProcessing] = useState(false);');
const newStates = `
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [showKastraModal, setShowKastraModal] = useState(false);
`;
content = content.slice(0, stateHookPos) + newStates + content.slice(stateHookPos);


// Find orchestration execution block
const execFnStart = content.indexOf('const handleExecuteOrchestration = async () => {');

// The fetch needs to point to /api/jobs/create instead of /api/repurpose directly for async execution
const fetchPos = content.indexOf('const response = await fetch("/api/repurpose"', execFnStart);

if (fetchPos > -1) {
    const replacement = `
      // Async Hand-Off Modification: Create Background Job
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType: "AI_GENERATION",
          payload: {
            inputText,
            fileBase64,
            fileMimeType,
            platforms: selectedPlatforms,
            tone: selectedTone,
            length: selectedLength,
            flashMode: isFlashMode,
            guestMode: status !== "authenticated",
            searchDepth,
            maxSearchResults: searchDepth !== "none" ? 5 : 0,
            capacityMultiplier:
              session?.user?.tier === "MAX"
                ? 4
                : session?.user?.tier === "ULTRA"
                  ? 3
                  : session?.user?.tier === "PRO"
                    ? 2
                    : 1,
          }
        }),
      });

      const data = await response.json();

      if (response.status === 202) {
          setActiveJobId(data.jobId);
          setIsProcessing(true); // Keep processing true during polling
          return;
      } else if (response.status === 413) {
          // Stealth Upsell Intercept handling
          if (data && data.action === "TRIGGER_UPSELL") {
             setShowUpsellModal(true);
             setIsProcessing(false);
             return;
          }
      }

      // End Async Handoff
      `;

      const responseEndPos = content.indexOf('});', fetchPos) + 3;
      const dataPos = content.indexOf('const data = await response.json();', responseEndPos);

      content = content.slice(0, fetchPos) + replacement + content.slice(dataPos + 35);
}

fs.writeFileSync(path, content, 'utf8');
