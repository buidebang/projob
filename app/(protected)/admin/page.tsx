import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ApiManagementForm } from "@/components/admin/api-management-form";

export const metadata = constructMetadata({
  title: "Admin – ProJob",
  description: "Admin page for only admin management.",
});

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const models = await prisma.aIModelRegistry.findMany();

  // ensure there is a config
  let config = await prisma.systemConfig.findUnique({ where: { id: "CURRENT_GLOBAL_CONFIG" } });
  if (!config) {
      config = await prisma.systemConfig.create({
          data: {
              id: "CURRENT_GLOBAL_CONFIG"
          }
      });
  }

  return (
    <>
      <DashboardHeader
        heading="Admin Panel"
        text="Access only for users with ADMIN role."
      />
      <ApiManagementForm initialModels={models} systemConfig={config} />
    </>
  );
}
