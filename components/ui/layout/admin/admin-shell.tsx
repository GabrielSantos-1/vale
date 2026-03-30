"use client";

import type { ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
};

export function AdminShell({ children, className }: AdminShellProps) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");

  if (isLogin) {
    return (
      <div
        data-admin-theme="true"
        className={cn("min-h-screen bg-background text-primary", className)}
      >
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[120px]" />
            <div className="absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_60%)]" />
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      data-admin-theme="true"
      className={cn("min-h-screen bg-background text-primary", className)}
    >
      <div className="relative flex min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[120px]" />
          <div className="absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-sky-400/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_60%)]" />
        </div>

        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
