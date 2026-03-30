import type { ReactNode } from "react";
import { Lexend } from "next/font/google";
import { AdminShell } from "@/components/ui/layout/admin/admin-shell";

const adminFont = Lexend({
  subsets: ["latin"],
  display: "swap",
});

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell className={adminFont.className}>{children}</AdminShell>;
}
