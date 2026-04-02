"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  CUSTOMER_PORTAL_COMING_SOON_ITEMS,
  whatsappSupportUrl,
} from "@/lib/constants/contact";

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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        <Link
          href="/"
          aria-label="Ir para a pagina inicial da Verde Vale Connect"
          className="group flex min-w-0 items-center"
        >
          <span className="relative block h-12 w-40 shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] md:h-14 md:w-48">
            <Image
              src="/brand/logo-verde-vale-connect.svg"
              alt="Logo Verde Vale Connect"
              fill
              sizes="(max-width: 768px) 160px, 192px"
              className="object-contain object-left"
            />
          </span>
        </Link>

        <nav aria-label="Navegacao principal" className="hidden items-center gap-1 md:flex">
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

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition duration-200 hover:bg-emerald-100"
          >
            WhatsApp rápido
          </a>

          <Link
            href="/contratar#formulario-solicitacao"
            className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:brightness-95"
          >
            Contratar agora
          </Link>
        </div>

        <div
          aria-label="Servicos em breve"
          className="hidden w-full items-center justify-end gap-2 md:flex"
        >
          {CUSTOMER_PORTAL_COMING_SOON_ITEMS.map((label) => (
            <span
              key={label}
              aria-disabled="true"
              className="inline-flex cursor-default items-center rounded-full border border-sky-200/70 bg-white/65 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {label} - Em breve
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
