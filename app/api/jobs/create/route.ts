import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateSignature } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Create AgentJob in database
    const job = await prisma.agentJob.create({
      data: {
        userId: user.id,
        jobType: body.jobType || "AI_GENERATION",
        status: "QUEUED",
        payload: body.payload || {},
      },
    });

    // Fire-and-forget: Trigger the background process without awaiting
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/jobs/process`;

    // Create cryptographic signature for the payload to authenticate webhook call
    const processPayload = JSON.stringify({ jobId: job.id });
    const signature = generateSignature(processPayload);

    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Signature": signature,
      },
      body: processPayload,
    }).catch(err => {
      console.error("[Job Creation - Webhook Trigger Error]:", err);
    });

    // Return 202 Accepted immediately with the jobId
    return NextResponse.json(
      { success: true, jobId: job.id, message: "Job queued successfully" },
      { status: 202 }
    );
  } catch (error: any) {
    console.error("[Job Creation Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
