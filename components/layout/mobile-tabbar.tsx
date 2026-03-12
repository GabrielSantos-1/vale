import Link from 'next/link'

export function MobileTabbar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between">
        <Link href="/">Início</Link>
        <Link href="/planos">Planos</Link>
        <Link href="/cobertura">Cobertura</Link>
        <Link href="/suporte">Suporte</Link>
      </div>
    </nav>
  )
}

export default MobileTabbar
