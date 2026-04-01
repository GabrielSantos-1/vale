import Image from "next/image";
import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/planos", label: "Planos" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/status", label: "Status" },
  { href: "/suporte", label: "Suporte" },
  { href: "/contato", label: "Contato" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-sky-200/70 bg-[linear-gradient(180deg,#f3f9ff_0%,#e8f3ff_42%,#dceeff_100%)] text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(45,212,191,0.12),transparent_22%),radial-gradient(circle_at_84%_16%,rgba(59,130,246,0.14),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.08),transparent_20%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.32),rgba(59,130,246,0.42),transparent)]"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="space-y-4">
            <span className="relative block h-14 w-44 shrink-0 overflow-hidden md:h-16 md:w-56">
              <Image
                src="/brand/logo-verde-vale-connect.svg"
                alt="Logo Verde Vale Connect"
                fill
                sizes="(max-width: 768px) 176px, 224px"
                className="object-contain object-left"
              />
            </span>

            <p className="max-w-md text-sm leading-6 text-slate-700">
              Internet fibra com planos claros, cobertura regional e atendimento mais proximo.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Navegacao
            </p>

            <nav
              aria-label="Links do rodape"
              className="flex flex-wrap gap-x-4 gap-y-3 text-sm text-slate-700"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors duration-200 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-sky-200/70 pt-5 text-xs text-slate-600">
          © {new Date().getFullYear()} Verde Vale Connect. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
