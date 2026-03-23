"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
  <aside className="hidden w-72 flex-col border-r border-white/10 bg-sidebar lg:flex">
    <div className="border-b border-white/10 px-6 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-bold text-white shadow-soft">
          VV
        </div>

        <div>
          <p className="font-semibold text-white">Verde Vale</p>
          <p className="text-xs text-muted">
            {/* trocado de text-slate-300 para text-muted para padronizar com o design system */}
            Painel administrativo
          </p>
        </div>
      </div>
    </div>

    <div className="flex-1 space-y-1 px-4 py-6">
      <p className="px-3 pb-2 text-xs uppercase tracking-wider text-muted">
        {/* trocado de text-slate-400 para text-muted para padronizar labels secundárias */}
        Navegação
      </p>

      {navItems.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-xl px-4 py-3 text-sm transition-all",
              active
                ? "bg-white text-primary font-semibold shadow-soft"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
              // text-slate-200 foi mantido porque está em fundo escuro; aqui funciona como texto secundário da sidebar
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>

    <div className="border-t border-white/10 p-4">
      <div className="rounded-xl border border-white/10 bg-white/10 p-3">
        <p className="text-sm font-semibold text-white">Sistema ativo</p>
        <p className="text-xs text-muted">
          {/* trocado de text-slate-300 para text-muted para manter consistência com o sistema */}
          Operacional e pronto
        </p>
      </div>
    </div>
  </aside>
);
}