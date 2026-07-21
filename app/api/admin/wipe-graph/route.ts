import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Attempt to delete all nodes from KnowledgeBase if the model exists
    // The previous schema search showed KnowledgeBase is being used for context nodes
    const deleteResult = await prisma.knowledgeBase.deleteMany({});

    return NextResponse.json({
        success: true,
        message: "Graph memory wiped.",
        count: deleteResult.count
    });
  } catch(e) {
      console.error(e);
      return NextResponse.json({ success: false, message: "Failed" }, { status: 500 });
  }
}
