import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "internal-dev-secret-key-12345";
const ENCRYPTION_KEY = crypto.scryptSync(process.env.AUTH_SECRET || WEBHOOK_SECRET, "salt", 32);
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

async function main() {
    const key = "AIzaSyBhsTDPryJ4jFq6gp5hPlCYXilrKhxQbR8";
    await prisma.systemConfig.upsert({
        where: { id: "CURRENT_GLOBAL_CONFIG" },
        update: {
            provider_google_key: encrypt(key),
            api_routing_mode: "DIRECT_PROVIDER",
            ai_target_model_id: "gemini-1.5-flash"
        },
        create: {
            id: "CURRENT_GLOBAL_CONFIG",
            provider_google_key: encrypt(key),
            api_routing_mode: "DIRECT_PROVIDER",
            ai_target_model_id: "gemini-1.5-flash"
        }
    });
    console.log("Key injected");
}
main().catch(console.error);
