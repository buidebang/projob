import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <div className="relative flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 lg:h-[60px] xl:px-8">
            <div className="text-sm font-semibold">WP-Style Admin Hub</div>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <UserAccountNav />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
