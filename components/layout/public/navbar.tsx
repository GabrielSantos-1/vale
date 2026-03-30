"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/planos#comparacao-planos", label: "Planos" },
  { href: "/cobertura#consulta-cobertura", label: "Cobertura" },
  { href: "/status#status-lista", label: "Status" },
  { href: "/suporte", label: "Suporte" },
  { href: "/contato#formulario-contato", label: "Contato" },
  { href: "/sobre", label: "Sobre" },
];

function isActivePath(pathname: string, href: string) {
  const cleanHref = href.split(/[?#]/)[0];
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200/70 bg-[linear-gradient(180deg,rgba(243,249,255,0.94)_0%,rgba(232,243,255,0.9)_42%,rgba(220,238,255,0.88)_100%)] supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(243,249,255,0.84)_0%,rgba(232,243,255,0.78)_42%,rgba(220,238,255,0.74)_100%)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <Link
          href="/"
          aria-label="Ir para a página inicial da Verde Vale"
          className="group flex min-w-0 items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-sm font-bold text-white shadow-soft transition-transform duration-200 group-hover:scale-[1.03]">
            VV
          </span>

          <div className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-primary md:text-[15px]">
              Verde Vale
            </span>
            <span className="block truncate text-[11px] text-secondary md:text-xs">
              Fibra • Cobertura • Transparência
            </span>
          </div>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/82 text-primary shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
                    : "text-secondary hover:bg-white/62 hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/contratar#formulario-solicitacao"
          className="hidden items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:brightness-95 md:inline-flex"
        >
          Contratar agora
        </Link>
      </div>
    </header>
  );
}
