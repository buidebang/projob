import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ActiveJobRegistry, ProcessingOrchestrator } from "@/lib/ai/orchestrator";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    let killedCount = 0;

    // Iterate through all active keys and abort them
    Array.from(ActiveJobRegistry.entries()).forEach(([jobId, controller]) => {
      controller.abort();
      ActiveJobRegistry.delete(jobId);
      killedCount++;
    });

    return NextResponse.json({
        success: true,
        message: `All neural threads aborted. Count: ${killedCount}`
    });
  } catch(e) {
      return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
  }
}
