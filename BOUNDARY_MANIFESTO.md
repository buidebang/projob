### THE BOUNDARY MANIFESTO (THE CONFESSION)

* **I CAN DO X:** I can execute Node.js scripts using `tsx` or `ts-node`. I can interact with a local PostgreSQL database running within the sandbox container. I can compile Next.js projects via `pnpm build`. I can execute and pass unit tests and integration tests written in TypeScript.
* **I CAN DO X:** I can make outbound API calls to the open internet (as proven by successfully hitting public endpoints like `httpbin.org`).
* **I CANNOT DO Y BECAUSE Z:** I cannot reliably spawn a long-running, interactive Next.js development server (`pnpm dev`) and hit it locally within the same linear script execution without implementing background process management and explicit wait-on utilities, which are flaky in constrained sandbox environments.
* **I CANNOT DO Y BECAUSE Z:** I cannot run Headless Browsers (like Puppeteer or Playwright) effectively within this specific turn because my environment either lacks the underlying OS dependencies for Chromium (e.g., `libnss3`, `libatk-bridge2.0-0`, `libxcomposite1`, `libxrandr2`), or requires massive dependency installations that exceed the time limit of a single execution block.
