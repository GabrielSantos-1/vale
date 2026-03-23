"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  MapPinned,
  CircleHelp,
  Activity,
  Mail,
  Settings,
  Wifi,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Planos", href: "/admin/planos", icon: Package },
  { label: "Cobertura", href: "/admin/cobertura", icon: MapPinned },
  { label: "FAQ", href: "/admin/faq", icon: CircleHelp },
  { label: "Status", href: "/admin/status", icon: Activity },
  { label: "Contato", href: "/admin/contato", icon: Mail },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-sidebar text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-5">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Wifi className="h-5 w-5 text-green-400" />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Verde Vale
            </p>
            <p className="text-xs text-slate-300">Painel administrativo</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 py-5">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition",
                    isActive
                      ? "text-green-600"
                      : "text-slate-300 group-hover:text-green-400",
                  ].join(" ")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-sm font-semibold text-white">Sistema operacional</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Painel em novo design system claro com identidade azul e verde.
          </p>
        </div>
      </div>
    </aside>
  );
}