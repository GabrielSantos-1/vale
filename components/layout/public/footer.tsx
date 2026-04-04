import Image from "next/image";
import Link from "next/link";
import { whatsappSupportUrl } from "@/lib/constants/contact";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/planos", label: "Planos" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/status", label: "Status da rede" },
  { href: "/suporte", label: "Suporte" },
  { href: "/contato", label: "Contato" },
];

const institutionalItems: NavItem[] = [
  { href: "/politica-de-privacidade", label: "Política de privacidade" },
  { href: "/termos", label: "Termos de uso" },
  { href: "/cliente/login", label: "Central do Cliente" },
  { href: "/suporte", label: "Falar com suporte" },
  { href: "/contato#formulario-contato", label: "Entrar em contato" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cyan-100/18 bg-[linear-gradient(180deg,rgba(7,18,34,0.84)_0%,rgba(9,24,43,0.88)_46%,rgba(10,28,48,0.92)_100%)] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.10),transparent_22%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.24),rgba(59,130,246,0.3),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,38,66,0.14)_0%,rgba(8,20,37,0.06)_36%,rgba(7,18,34,0.14)_100%)]"
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
                className="object-contain object-left brightness-110"
              />
            </span>

            <p className="max-w-md text-sm leading-6 text-slate-200/90">
              Internet fibra com planos claros, cobertura regional e atendimento próximo.
            </p>

            <div className="max-w-md rounded-2xl border border-cyan-100/24 bg-slate-950/14 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/90">
                Presença institucional
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200/88">
                Provedor regional com comunicação operacional clara, canais oficiais de atendimento
                e publicação contínua de status, cobertura e orientações ao assinante.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/92">
                Navegação
              </p>

              <nav
                aria-label="Links de navegação do rodapé"
                className="flex flex-wrap gap-x-4 gap-y-3 text-sm text-slate-200/88"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors duration-200 hover:text-cyan-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/92">
                Institucional
              </p>

              <nav
                aria-label="Links institucionais"
                className="flex flex-wrap gap-x-4 gap-y-3 text-sm text-slate-200/88"
              >
                {institutionalItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors duration-200 hover:text-cyan-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/92">
                Acesso rápido
              </p>

              <div className="flex flex-wrap gap-2">
                <a
                  href={whatsappSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-emerald-300/45 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition duration-200 hover:bg-emerald-400/16"
                >
                  Falar no WhatsApp
                </a>

                <span
                  aria-disabled="true"
                  className="inline-flex cursor-default items-center rounded-full border border-cyan-100/22 bg-slate-950/16 px-3 py-1 text-xs font-medium text-slate-100/90 backdrop-blur-sm"
                >
                  2ª via: em breve
                </span>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-300/92">
              Dados cadastrais e informações regulatórias são disponibilizados pelos canais oficiais
              de atendimento, conforme atualização operacional.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-cyan-100/20 pt-5 text-xs text-slate-300/88">
          © {new Date().getFullYear()} Verde Vale Connect. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
