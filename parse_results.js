const fs = require('fs');

const parsedOutputs = {
  "google": {
    "textContent": "How to Automate Backend Bug Fixes Using Lextit AI\nTo resolve recurring server crashes and automate backend code generation, follow these 3 steps:\n1. Integrate the Lextit Master-Worker Node into your repository.\n2. Configure the autonomous agent's memory graph permissions.\n3. Deploy the self-healing orchestration loop to intercept build errors.",
    "mediaAsset": null,
    "metadata": {
      "footprint": "citation: Lextit Documentation (2026)"
    }
  },
  "tiktok": {
    "textContent": "Stop wasting your weekends fixing backend bugs. You are burning out and the deployments still fail. Instead, use this one autonomous agent setup... [Shows Lextit dashboard intercepting an error]. It writes the code and pushes the fix while you sleep. Beta access just dropped, don't miss the wave.",
    "mediaAsset": null,
    "metadata": {
      "footprint": "https://github.com/lextit-hq/nextjs-memory-leak-fix-2026"
    }
  },
  "instagram": {
    "textContent": "Ready to stop coding mundane backend patches? Read below 👇 [LSI Keywords: Autonomous Agents, AI Server Management, Automated Bug Fixing, Lextit Beta, Nextjs, Web Development]. Slide 1: The Problem with Manual Server Management. Slide 2: Enter Lextit's Self-Healing Architecture...",
    "mediaAsset": null,
    "metadata": {
      "footprint": "@lextit_ai_architect"
    }
  },
  "youtube": {
    "textContent": "The ONLY Way to Automate Server Management in 2026 (No BS)... If your backend crashes at 3 AM and you're the one fixing it, you have a fatal workflow bottleneck. In the next 8 minutes, I’m going to show you exactly how to deploy an autonomous agent that fixes its own code. Let's dive in.",
    "mediaAsset": null,
    "metadata": {
      "footprint": "?timestamp=2026-07-01T12:00:00Z&query=self-critiquing-audit-loop"
    }
  },
  "x": {
    "textContent": "99% of developers are still manually debugging their servers. They treat AI like a glorified autocomplete, missing out on true autonomous routing. Here is how to build a self-healing backend architecture using Lextit in 5 steps: 🧵👇",
    "mediaAsset": null,
    "metadata": {
      "footprint": "metadata: { source: 'lextit-ai-sdk-guide' }"
    }
  },
  "linkedin": {
    "textContent": "I almost gave up on my deployments yesterday.\n\nThe build loop was failing. The servers crashed. I stared at the terminal for 6 hours.\n\nBut then I realized something fundamental about system architecture: Human intervention is the bottleneck.\n\nHere is how decoupling the backend from manual oversight using Lextit's autonomous agents saved my project (and my sanity):",
    "mediaAsset": null,
    "metadata": {
      "footprint": "#LextitArchitecture #B2B #AI"
    }
  },
  "telegram": {
    "textContent": "🚨 URGENT PLATFORM UPDATE 🚨\n\nWe just launched the Lextit Beta.\n\n👉 The Alpha: Autonomous agents that write code and manage servers.\n👉 Impact: Zero human intervention for backend bugs.\n\nOpening access to the first 500 developers now. Stay tuned. ⚡️",
    "mediaAsset": null,
    "metadata": {
      "footprint": "[Lextit Core Systems Update](https://lextit.io/alpha/ts2307-fix)"
    }
  },
  "reddit": {
    "textContent": "Show Reddit: I built an autonomous platform where agents write code and fix backend bugs without human help. Hey everyone, got tired of 3 AM server crashes. Wrote a custom orchestrator that pipes system errors directly to an autonomous agent before hitting the on-call pager. Tech stack: Next.js App Router, TryAI Audit logic, Lextit. Here is a snippet of the self-healing logic: [Code Block]. Beta is open for feedback.",
    "mediaAsset": null,
    "metadata": {
      "footprint": "u/LextitDev"
    }
  }
};

console.log(JSON.stringify(parsedOutputs, null, 2));
