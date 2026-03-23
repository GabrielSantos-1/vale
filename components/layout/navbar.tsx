import Link from "next/link";

const navItems = [
  { href: "/planos", label: "Planos" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/status", label: "Status" },
  { href: "/suporte", label: "Suporte" },
  { href: "/contato", label: "Contato" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-soft transition group-hover:brightness-95">
              VV
            </span>

            <div className="leading-tight">
              <span className="block text-sm font-semibold text-primary">
                Verde Vale
              </span>
              <span className="block text-xs text-secondary">
                Fibra • Cobertura • Transparência
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-secondary transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contratar"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-95"
          >
            Contratar agora
          </Link>
        </div>
      </div>
    </header>
  );
}