import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-secondary">
        © {new Date().getFullYear()} Verde Vale. Todos os direitos reservados.
      </div>
    </footer>
  )
}

