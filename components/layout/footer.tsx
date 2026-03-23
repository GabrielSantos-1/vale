import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-secondary">
        © {new Date().getFullYear()} Verde Vale. Todos os direitos reservados.
      </div>
    </footer>
  );
}