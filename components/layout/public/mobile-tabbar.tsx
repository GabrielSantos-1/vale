"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const mobileItems = [
  { href: "/", label: "Início" },
  { href: "/planos#comparacao-planos", label: "Planos" },
  { href: "/cobertura#consulta-cobertura", label: "Cobertura" },
  { href: "/suporte", label: "Suporte" },
  { href: "/sobre", label: "Sobre" },
];

function isActivePath(pathname: string, href: string) {
  const cleanHref = href.split(/[?#]/)[0];
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

export function MobileTabbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-[rgba(248,251,255,0.86)] supports-[backdrop-filter]:bg-[rgba(248,251,255,0.72)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-5 gap-1 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        {mobileItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-2 text-center text-[11px] font-medium transition-all duration-200",
                active
                  ? "bg-white text-primary shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                  : "text-secondary hover:bg-white/70 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileTabbar;
