"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Planos", href: "/admin/planos" },
  { label: "Cobertura", href: "/admin/cobertura" },
  { label: "FAQ", href: "/admin/faq" },
  { label: "Status", href: "/admin/status" },
  { label: "Contato", href: "/admin/contato" },
];

function formatTitle(pathname: string) {
  if (!pathname || pathname === "/admin") return "Dashboard";

  const clean = pathname.replace("/admin/", "");
  if (!clean) return "Dashboard";

  return clean
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

export function AdminHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const title = useMemo(() => formatTitle(pathname), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-header">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-secondary transition hover:bg-surface-secondary hover:text-primary lg:hidden"
              aria-label="Abrir menu"
            >
              ☰
            </button>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-accent">
                Admin
              </p>
              <h1 className="text-lg font-semibold text-primary capitalize">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <input
                placeholder="Buscar..."
                className="h-10 w-56 rounded-xl border border-border bg-surface px-4 text-sm text-primary outline-none transition placeholder:text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-soft">
              G
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden">
          <div className="h-full w-72 border-r border-border bg-white p-5 shadow-soft-lg">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-secondary transition hover:bg-surface-secondary hover:text-primary"
              aria-label="Fechar menu"
            >
              ✕
            </button>

            <div className="space-y-2">
              {navItems.map((item) => (
                <MobileLink key={item.href} href={item.href}>
                  {item.label}
                </MobileLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:bg-surface-secondary hover:text-primary"
    >
      {children}
    </Link>
  );
}