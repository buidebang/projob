
# Deep Search Architecture Report

## The Engine Selection
**Engine:** Jina AI Reader (`r.jina.ai`)
**Architectural Justification:** Selected for its zero-configuration, ultra-lightweight REST interface that instantly converts complex DOM structures into LLM-friendly Markdown. It bypasses the need for local Headless Chrome instances, thereby preventing memory leaks and avoiding the high overhead and latency associated with custom web scrapers. We implemented a "Highest Entropy Payload" pre-processing step that truncates the raw output to a maximum of 8,000 characters to prevent context window overflow and API cost inflation.

## The Admin Sync Result
We updated `lib/rate-limiter.ts` to enforce the Dynamic Profit Engine Hook.
Specifically, if a user approaches their maximum mathematically-computed token limit based on their Tier Price and the Admin Target Margin (e.g., 70% or 85%), the system artificially throttles them by downgrading the `searchDepth` to `basic` or `none` and reducing the context size. This ensures the Scraping API (if billed) and the larger LLM prompt size do not violate the unit economics.

## Live Test Output (PROJOB OUTPUT)

Everyone is cheering AgentX's new '$0.005' API pricing.

 Read the damn Terms of Service.

 They have a hidden 5k token minimum per request. If your app sends a 50-token query, you pay for 5,000. It's a synthetic tax on lightweight agentic workflows.

 Stop building on predatory infra.

## Failure States Handled
- **Guest Tier:** If a Guest attempts Deep Search, the UI toggle natively prevents the call and triggers the Stripe Upsell Modal (`setShowUpsellModal(true)`).
- **Free Tier:** Similar to Guest, Free tier is hard-blocked at the UI level for extreme depth. On the backend, if they bypass the UI, the `evaluateUsageAndGetModel` assigns `searchDepth: 'basic'`, and restricts `maxSearchResults` to 2.
- **Cost Protection:** When margin is set to 85% instead of 60%, the mathematical budget reduces the `calculatedLimit`. Once `tokensConsumed >= calculatedLimit * 0.8`, the `searchDepth` is aggressively scaled back to protect the margin from expensive extreme search vectors.
