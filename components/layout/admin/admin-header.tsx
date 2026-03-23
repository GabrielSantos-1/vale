"use client";

import { Bell, Search, Settings } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-header">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden md:flex">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-soft">
              <Search className="h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar no painel..."
                className="w-56 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-secondary transition hover:bg-surface-secondary hover:text-primary"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-secondary transition hover:bg-surface-secondary hover:text-primary"
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-soft">
              GV
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-primary">Administrador</p>
              <p className="text-xs text-muted">Painel Verde Vale</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}