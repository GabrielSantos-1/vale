"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Planos", href: "/admin/planos" },
  { label: "Cobertura", href: "/admin/cobertura" },
  { label: "FAQ", href: "/admin/faq" },
  { label: "Status", href: "/admin/status" },
  { label: "Contato", href: "/admin/contato" },
];

const pageMeta: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  "/admin": {
    eyebrow: "Admin",
    title: "Dashboard",
    description: "Visão executiva da operação.",
  },
  "/admin/dashboard": {
    eyebrow: "Admin",
    title: "Dashboard",
    description: "Visão executiva da operação.",
  },
  "/admin/leads": {
    eyebrow: "Comercial",
    title: "Leads",
    description: "Pipeline, conversão e acompanhamento comercial.",
  },
  "/admin/planos": {
    eyebrow: "Catálogo",
    title: "Planos",
    description: "Gestão dos planos publicados no site.",
  },
  "/admin/cobertura": {
    eyebrow: "Operação",
    title: "Cobertura",
    description: "Áreas, CEPs e disponibilidade da rede.",
  },
  "/admin/faq": {
    eyebrow: "Conteúdo",
    title: "FAQ",
    description: "Perguntas frequentes do site público.",
  },
  "/admin/status": {
    eyebrow: "Operação",
    title: "Status",
    description: "Avisos e comunicação operacional com clientes.",
  },
  "/admin/contato": {
    eyebrow: "Atendimento",
    title: "Contato",
    description: "Mensagens recebidas pelo site institucional.",
  },
};

function resolvePageMeta(pathname: string) {
  if (pageMeta[pathname]) return pageMeta[pathname];

  const matched = Object.keys(pageMeta).find(
    (key) => key !== "/admin" && pathname.startsWith(key + "/")
  );

  if (matched) return pageMeta[matched];

  return {
    eyebrow: "Admin",
    title: "Painel",
    description: "Gestão central do sistema.",
  };
}

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

export function AdminHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const meta = useMemo(() => resolvePageMeta(pathname), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-header backdrop-blur-xl">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white/70 text-secondary transition hover:bg-white hover:text-primary lg:hidden"
                aria-label="Abrir menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-accent">
                  {meta.eyebrow}
                </p>
                <h1 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-secondary">{meta.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:w-[320px]">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  placeholder="Buscar módulo, lead ou conteúdo..."
                  className="h-11 w-full rounded-2xl border border-border bg-white/80 pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-muted focus:border-[color:var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <IconButton label="Notificações">
                  <BellIcon className="h-4 w-4" />
                </IconButton>

                <IconButton label="Configurações">
                  <SettingsIcon className="h-4 w-4" />
                </IconButton>

                <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/80 px-3 py-2.5 shadow-soft">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-primary">Gabriel</p>
                    <p className="text-xs text-muted">Administrador</p>
                  </div>

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-white shadow-soft">
                    G
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 hidden items-center gap-2 overflow-x-auto xl:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center rounded-2xl border px-3.5 py-2 text-sm font-medium transition-all",
                    active
                      ? "border-emerald-400/30 bg-emerald-400/10 text-primary"
                      : "border-transparent bg-transparent text-secondary hover:border-border hover:bg-surface-secondary hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden">
          <div className="flex h-full max-w-[320px] flex-col border-r border-white/10 bg-sidebar/95 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-white">Verde Vale</p>
                <p className="text-xs text-slate-300">Painel administrativo</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => (
                <MobileLink
                  key={item.href}
                  href={item.href}
                  active={isActive(pathname, item.href)}
                  onNavigate={() => setOpen(false)}
                >
                  {item.label}
                </MobileLink>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function IconButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white/70 text-secondary transition hover:bg-white hover:text-primary"
    >
      {children}
    </button>
  );
}

function MobileLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "block rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-white"
          : "border-transparent text-slate-100 hover:border-white/10 hover:bg-white/5 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

function iconWrapper(path: React.ReactNode, className?: string) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>,
    className
  );
}

function CloseIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>,
    className
  );
}

function SearchIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
    className
  );
}

function BellIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M15 17H5l1.4-1.4A2 2 0 0 0 7 14.2V11a5 5 0 1 1 10 0v3.2a2 2 0 0 0 .6 1.4L19 17h-4" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>,
    className
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.6 1.6 0 0 0 15 19.4a1.6 1.6 0 0 0-1 .6 1.6 1.6 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-.4-1 1.6 1.6 0 0 0-1-.6 1.6 1.6 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-.6-1 1.6 1.6 0 0 0-1-.4H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1-.4 1.6 1.6 0 0 0 .6-1 1.6 1.6 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 1-.6 1.6 1.6 0 0 0 .4-1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 .4 1 1.6 1.6 0 0 0 1 .6 1.6 1.6 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9c0 .38.22.74.6 1 .3.2.65.3 1 .3H21a2 2 0 1 1 0 4h-.1c-.35 0-.7.1-1 .3-.38.26-.6.62-.6 1Z" />
    </>,
    className
  );
}
