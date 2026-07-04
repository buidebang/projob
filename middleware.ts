import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function middleware(request: NextRequest) {
  const emailCheckPath = request.nextUrl.pathname.startsWith("/api/auth");
  const repurposePath = request.nextUrl.pathname.startsWith("/api/repurpose");

  // Block programmatic aliases containing plus (+) characters
  if (emailCheckPath && request.method === "POST") {
    try {
      const cloned = request.clone();
      const body = await cloned.json();
      if (body?.email && body.email.includes("+")) {
        return new NextResponse(
          JSON.stringify({ error: "Programmatic email routing aliases are prohibited." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) { /* Fail-safe fallback parsing */ }
  }

  // Stateless Guest Rate-Limiting via Compound Fingerprinting
  if (repurposePath) {
    const authHeader = request.headers.get("Authorization");
    const sessionToken = request.cookies.get("next-auth.session-token");
    const sessionTokenSecure = request.cookies.get("__Secure-next-auth.session-token");

    // Only execute Redis transaction checks for non-authenticated canvas guests
    if (!authHeader && !sessionToken && !sessionTokenSecure) {
      const ua = request.headers.get("user-agent") || "generic-agent";
      const lang = request.headers.get("accept-language") || "en";
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const fingerprint = btoa(`${ua}:${lang}:${ip}`).substring(0, 32);

      const rateKey = `projob:guest:throttle:${fingerprint}`;

      try {
        const usageCount = await redis.incr(rateKey);
        if (usageCount === 1) await redis.expire(rateKey, 86400); // 24-hour cycle boundary

        if (usageCount > 3) {
          return new NextResponse(
            JSON.stringify({ error: "Anonymous processing threshold reached. Authenticate to unlock unlimited bandwidth." }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (err) {
        console.error("Upstash Edge Caching Communication Failure:", err);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
