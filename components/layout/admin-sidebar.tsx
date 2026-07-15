"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r bg-muted/30 px-3 py-4">
      <div className="mb-8 flex items-center px-2">
        <Icons.logo className="mr-2 size-6" />
        <span className="text-lg font-bold">ProJob Admin</span>
      </div>
      <nav className="space-y-1">
        <Link
          href="/admin"
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin" ? "bg-accent text-accent-foreground" : "transparent"
          )}
        >
          <Icons.dashboard className="mr-2 size-4" />
          Dashboard
        </Link>
        <Link
          href="/admin"
          className={cn(
            "transparent flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icons.settings className="mr-2 size-4" />
          API Management
        </Link>
      </nav>
    </div>
  );
}
