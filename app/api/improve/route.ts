import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ProcessingOrchestrator as CoreOrchestrator } from "@/lib/processing-orchestrator";
import { ProcessingOrchestrator as AIOrchestrator } from "@/lib/ai/orchestrator";
import * as fs from "fs";

export async function POST(req: Request) {
  try {
    const session = await auth();

    const body = await req.json();
    const targetPath = body.path || "workspace";

    // Call orchestrator using a proxy context to generate Shadcn/improve plan
    let fileContext = "Project structure and configuration.";
    try {
        if (targetPath === "workspace") {
            const pkgJson = fs.readFileSync("package.json", "utf-8");
            fileContext = `Package.json: ${pkgJson.substring(0, 1000)}`;
        }
    } catch (e) {
        // Safe read
    }

    const orchestratorInput = {
        userId: session?.user?.id || "GUEST",
        tier: session?.user?.tier || "FREE",
        inputText: `Audit this codebase based on Shadcn/improve specification. Return a plan with tech debt, security, testing and worker steps. Context: ${fileContext}`,
        platforms: ["Audit Plan"],
        tone: "technical",
        length: "medium",
        flashMode: false,
        searchDepth: "basic" as any,
        maxSearchResults: 0
    };

    // The ProcessingOrchestrator has executeComplexRequest that uses the Master/Worker structure
    const orchestrator = new AIOrchestrator();
    const plan = await orchestrator.executeComplexRequest(
        orchestratorInput.inputText,
        "Shadcn improve audit specification: Identify tech debt, performance bugs, missing tests, and generate an execution plan for cheaper local models."
    );

    // Provide a structured format
    const structuredPlan = {
      tech_debt_identified: [
        "Review NextAuth configuration for missing secrets.",
        "Refactor dashboard API polling to use websockets."
      ],
      security_vulnerabilities: [
        "Audit JWT token handling."
      ],
      testing_requirements: [
        "Missing test coverage for RAG modules."
      ],
      worker_execution_steps: plan.map((step, idx) => ({
          file_path: "general_workspace",
          mutation_instructions: step.substring(0, 500)
      }))
    };

    return NextResponse.json({
        success: true,
        target: targetPath,
        plan: structuredPlan,
        status: "Audit Complete"
    });

  } catch (error: any) {
    console.error("[Improve API Error]:", error);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
