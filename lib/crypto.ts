import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "internal-dev-secret-key-12345";

export function generateSignature(payload: string): string {
  return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
}

export function verifySignature(payload: string, signature: string): boolean {
  if (!signature) return false;

  const expectedSignature = generateSignature(payload);

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
