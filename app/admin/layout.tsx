import type { ReactNode } from "react";
import { AdminShell } from "@/components/ui/layout/admin/admin-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}