# Modularity Report: Enterprise Resilience Audit

## 1. Deep Search Timeout Vulnerability
**Problem Location:** `lib/ai/deep-search.ts`
**Description:** The native `fetch` call in `DeepSearchEngine.execute` has no configured timeout. If `r.jina.ai` is slow or unresponsive, the thread will hang indefinitely, leading to memory leaks and unhandled promise rejections blocking the Node.js event loop.

### Proposed Solutions:
1. **Simple setTimeout Abort:** Wrap the fetch in a `Promise.race` against a simple `setTimeout` reject. (Pros: Easy. Cons: Does not cancel the actual TCP request, still consumes resources).
2. **AbortController Implementation:** Pass an `AbortSignal` with a specific timeout to gracefully close the connection. (Pros: Closes socket, resource efficient. Cons: Fails immediately on single hiccup).
3. **Enterprise-Grade: AbortController + Exponential Backoff Retry:** Combine `AbortController` with a retry mechanism that introduces exponential delays between attempts. (Pros: Best resilience against transient failures while protecting system resources. Cons: Slight complexity increase).

### Chosen Architecture: Solution 3 (Enterprise-Grade: AbortController + Exponential Backoff Retry)
**Implementation Details:** We will introduce a retry loop (max 3 retries) with a base delay of 1000ms. Each fetch will be bounded by an `AbortController` set to 15000ms timeout to ensure the process never hangs permanently.

---

## 2. API Rate Limiting (429) & Transient Network Errors
**Problem Location:** `lib/ai-gateway.ts`
**Description:** The `AIGateway.executePayload` executes a direct `fetch` to OpenRouter or the direct provider. If the external provider returns a 429 Rate Limit error or a 5xx Server error, the system immediately fails the task, leading to poor user experience.

### Proposed Solutions:
1. **Fire and Forget (Current State):** Throw the error immediately and rely on the client to retry. (Pros: Simple. Cons: Terrible UX).
2. **Static Retry Loop:** Catch failures and retry exactly 3 times with a static 2-second delay. (Pros: Better than nothing. Cons: Thundering herd problem where all requests retry simultaneously).
3. **Enterprise-Grade: Exponential Backoff with Jitter:** Implement a retry mechanism that exponentially increases the wait time (e.g., 1s, 2s, 4s) and adds randomized jitter to prevent API slamming.

### Chosen Architecture: Solution 3 (Enterprise-Grade: Exponential Backoff with Jitter)
**Implementation Details:** The `fetch` call will be wrapped in a helper function that retries on 429s and 5xx errors, up to 3 times, using exponential backoff + jitter. This ensures resilience without getting IP-banned by providers.
