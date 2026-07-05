import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import ConfigForm from "./config-form";
import ModelsForm from "./models-form";
import UsersTable from "./users-table";
import { getSystemConfig } from "@/lib/db";
import { getModels } from "@/actions/models";
import { getUsers } from "@/actions/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = constructMetadata({
  title: "System Config – SaaS Starter",
  description: "Global system configuration and unit economics.",
});

export default async function ConfigPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const config = await getSystemConfig();
  const modelsRes = await getModels();
  const usersRes = await getUsers();

  return (
    <>
      <DashboardHeader
        heading="System Configuration"
        text="Manage AI Routing, Unit Economics, and Feature Gating."
      />

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="config">System Config & Margins</TabsTrigger>
          <TabsTrigger value="models">AI Model Registry</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <div className="flex flex-col gap-5">
            <ConfigForm initialConfig={config} />
          </div>
        </TabsContent>

        <TabsContent value="models">
          <ModelsForm initialModels={modelsRes.models || []} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTable initialUsers={usersRes.users || []} />
        </TabsContent>
      </Tabs>
    </>
  );
}
