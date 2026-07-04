1. **Extend Prisma Schema**:
   - In `prisma/schema.prisma`, add `decayBypassed` (Boolean, default: `false`), `dailyUsageCount` (Int, default: `0`), `lastRequestTimestamp` (DateTime, default: `now()`) to the `User` model.
   - Add `parallelChannels` (String[]) and `qualityCoefficient` (Float) to the `Usage` model.
   - Run `npx prisma generate` after changing the schema.
   - Read `prisma/schema.prisma` to verify the fields were added correctly.

2. **Unification of Protected Routes**:
   - Delete legacy pages by running `rm -rf app/(protected)/dashboard/billing app/(protected)/dashboard/settings app/(protected)/dashboard/charts`.
   - In `app/(protected)/dashboard/page.tsx`, add a config slide-out drawer (similar to the one in `app/(marketing)/page.tsx`) by introducing a `showConfigMenu` state and rendering the absolute positioned drawer when toggled, containing profile and billing tier adjustments, preventing full-page reloads.
   - Verify file structure changes using `ls -la app/(protected)/dashboard` and `read_file app/(protected)/dashboard/page.tsx`.

3. **Stripe Webhook Refactoring**:
   - Edit `app/api/webhooks/stripe/route.ts` to process the $5 micro-upsell.
   - Within `case 'checkout.session.completed':`, check `if (session.metadata?.purchaseType === "decay_bypass_boost")`. If so, extract `session.metadata.userId`, run Prisma `update` to set `decayBypassed: true` and increment `credits` by `50000`, then return a `200` response.
   - Verify changes using `read_file app/api/webhooks/stripe/route.ts`.

4. **Edge Middleware**:
   - Edit `middleware.ts` to include logic for `/api/repurpose`.
   - Add a `middleware` function that intercepts requests to `/api/repurpose`. Check the request body for plusses (`+`). If a plus is present, return a `400` error.
   - For guest users (no authentication token), compute a SHA-256 hash using `User-Agent`, `Accept-Language`, and forwarded IP headers. Use Redis caching layer (`@upstash/redis` or the imported `redis` from `lib/db.ts`) to track and enforce 3 runs/day.
   - Verify modifications using `read_file middleware.ts`.

5. **Parallel Channel Output Architecture**:
   - Edit `app/api/repurpose/route.ts` to evaluate user tier and dynamically limit output platforms.
   - Find `platforms` extraction. Calculate `allowedChannelsCount` (Guest/Free: 1, Pro: 2, Max: length) based on `activeUserTier`. Slice `platforms` array. Parallelize execution using `Promise.all` for allowed channels.
   - Verify changes using `read_file app/api/repurpose/route.ts`.

6. **Algorithmic Content Auditing UI**:
   - Inside `app/(marketing)/page.tsx` and `app/(protected)/dashboard/page.tsx`, modify the scoreboard indicator HTML to use dynamic Tailwind states: `text-emerald-400` for scores > 80, `text-amber-400` for warnings (between 50 and 80), and `text-rose-500` for critical optimization failures (< 50).
   - Ensure actionable optimization cards are rendered when a check fails (`check.passed === false`), displaying a glassmorphic warning banner (`bg-[#070b19]/40 border border-slate-900`) with the mitigation tip inline.
   - Verify changes using `read_file app/(marketing)/page.tsx`.

7. **Layout Jump Mitigation**:
   - In `app/(marketing)/page.tsx` and `app/(protected)/dashboard/page.tsx`, wrap dynamic parameters like `useSession()` status in conditional skeletons (e.g., rendering an empty `div` with matching height/width when `status === "loading"`).
   - Use non-blocking opacity masks (e.g., `className={status === "loading" ? "opacity-0" : "opacity-100 transition-opacity"}`) for text derived from the session to maintain constant layout dimensions.
   - Verify changes using `read_file app/(marketing)/page.tsx`.

8. **Pre-Commit Steps**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

9. **Final Verification**:
   - Run `pnpm build` to verify the entire system compiles correctly without regressions.
   - Run tests if any exist to verify changes.
