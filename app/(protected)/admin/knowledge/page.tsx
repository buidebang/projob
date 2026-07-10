import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import KnowledgeForm from "./knowledge-form";

export const metadata = constructMetadata({
  title: "Knowledge Base – ProJob",
  description: "Upload RAG reference files for AI.",
});

export default async function KnowledgePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <>
      <DashboardHeader
        heading="Knowledge Base (RAG)"
        text="Upload reference files to update AI generation rules."
      />
      <div className="grid gap-5">
        <KnowledgeForm />
      </div>
    </>
  );
}
