import type { ReactNode } from "react";
import PageShell from "@/components/layout/public/page-shell";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <PageShell>{children}</PageShell>;
}