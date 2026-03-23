import Link from "next/link";

const mobileItems = [
  { href: "/", label: "Início" },
  { href: "/planos", label: "Planos" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/suporte", label: "Suporte" },
];

export function MobileTabbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-header md:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-4 px-2 py-2">
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium text-secondary transition hover:bg-surface-secondary hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default MobileTabbar;