import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="w-full border-b border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-accent">Verde Vale</Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/planos">Planos</Link>
          <Link href="/cobertura">Cobertura</Link>
          <Link href="/suporte">Suporte</Link>
          <Link href="/contato">Contato</Link>
        </nav>
      </div>
    </header>
  )
}

