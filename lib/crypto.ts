import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "internal-dev-secret-key-12345";

// A 32-byte key derived from AUTH_SECRET or WEBHOOK_SECRET
const ENCRYPTION_KEY = crypto.scryptSync(process.env.AUTH_SECRET || WEBHOOK_SECRET, "salt", 32);
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  if (!text) return text;
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (e) {
    return "";
  }
}

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
