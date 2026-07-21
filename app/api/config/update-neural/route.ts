import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const payload = await req.json();

    const config = await prisma.systemConfig.upsert({
      where: { id: "CURRENT_GLOBAL_CONFIG" },
      update: {
        auditStrictness: payload.auditStrictness,
        concurrencyLimit: payload.concurrencyLimit,
        deepSearchCap: payload.deepSearchCap,
        enableSkillscript: payload.enableSkillscript,
        enableGraphify: payload.enableGraphify,
        enableDeepSearch: payload.enableDeepSearch,
      },
      create: {
        id: "CURRENT_GLOBAL_CONFIG",
        auditStrictness: payload.auditStrictness,
        concurrencyLimit: payload.concurrencyLimit,
        deepSearchCap: payload.deepSearchCap,
        enableSkillscript: payload.enableSkillscript,
        enableGraphify: payload.enableGraphify,
        enableDeepSearch: payload.enableDeepSearch,
      }
    });

    return NextResponse.json({ success: true, message: "Neural architecture synchronized.", config });
  } catch(e) {
      return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
  }
}
