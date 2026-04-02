"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const operationsItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Leads", href: "/admin/leads", icon: UsersIcon },
  { label: "Cobertura", href: "/admin/cobertura", icon: CoverageIcon },
  { label: "Contato", href: "/admin/contato", icon: MessageIcon },
];

const contentItems: NavItem[] = [
  { label: "Planos", href: "/admin/planos", icon: LayersIcon },
  { label: "FAQ", href: "/admin/faq", icon: HelpIcon },
  { label: "Status", href: "/admin/status", icon: ActivityIcon },
];

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative hidden w-[292px] shrink-0 overflow-hidden border-r border-white/10 bg-sidebar backdrop-blur-xl lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.98),rgba(9,24,43,0.98))]" />
      </div>

      <div className="relative border-b border-white/10 px-5 py-5">
        <Link href="/admin/dashboard" className="flex flex-col gap-2">
          <div className="relative block h-14 w-48 overflow-hidden md:h-16 md:w-56">
            <Image
              src="/brand/logo-verde-vale-connect-light.svg"
              alt="Logo Verde Vale Connect"
              fill
              sizes="(max-width: 1024px) 192px, 224px"
              className="object-contain object-left"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs text-slate-300">Painel administrativo</p>
          </div>
        </Link>
      </div>

      <div className="relative flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <SidebarSection title="Operação" items={operationsItems} pathname={pathname} />

        <SidebarSection title="Conteúdo" items={contentItems} pathname={pathname} />
      </div>

      <div className="relative space-y-4 overflow-hidden border-t border-white/10 p-4">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url('/images/admin/hero-fiber.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.9),rgba(7,17,31,0.82))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_45%)]" />
        </div>

        <div className="relative space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-400/25"
          >
            <PlusIcon className="h-4 w-4" />
            Novo lead
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Sistema ativo</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Operação estável, pronta para gestão comercial e institucional.
                </p>
              </div>

              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                Ambiente
              </p>
              <p className="mt-1 text-sm font-medium text-white">Admin - Verde Vale Connect</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <section className="space-y-2">
      <p className="px-3 text-[11px] uppercase tracking-[0.22em] text-slate-300">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all duration-200",
                active
                  ? "border-emerald-400/20 bg-white/10 text-white shadow-[0_10px_30px_rgba(16,185,129,0.10)]"
                  : "border-transparent text-slate-100 hover:border-white/10 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
                  active
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-slate-200 group-hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <span className="truncate font-medium">{item.label}</span>

                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-200",
                    active
                      ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                      : "bg-transparent group-hover:bg-white/30"
                  )}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
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

function HomeIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </>,
    className
  );
}

function UsersIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    className
  );
}

function CoverageIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M7 12a5 5 0 0 1 10 0" />
      <path d="M10 12a2 2 0 0 1 4 0" />
      <path d="M12 18h.01" />
    </>,
    className
  );
}

function MessageIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </>,
    className
  );
}

function LayersIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>,
    className
  );
}

function HelpIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
    </>,
    className
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M22 12h-4l-3 7-4-14-3 7H2" />
    </>,
    className
  );
}

function PlusIcon({ className }: { className?: string }) {
  return iconWrapper(
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>,
    className
  );
}


