import { NextResponse } from "next/server";
import { getSystemConfig } from "@/lib/db";

export async function GET() {
  try {
    const config = await getSystemConfig();
    return NextResponse.json({
      globalAiEnabled: config.global_ai_generation_enabled,
      deepSearchEnabled: config.deep_search_enabled,
    });
  } catch (error) {
    console.error("[Config Route Error]:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
