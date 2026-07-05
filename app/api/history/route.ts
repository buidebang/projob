import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export async function GET(req: Request) {
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

    const history = await prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 15,
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("[History GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inputText, platform, model, output } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newGeneration = await prisma.generation.create({
      data: {
        userId: user.id,
        inputText: inputText || "",
        platform,
        model,
        output,
      },
    });

    return NextResponse.json({ success: true, generation: newGeneration });
  } catch (error: any) {
    console.error("[History POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to save history" },
      { status: 500 },
    );
  }
}
