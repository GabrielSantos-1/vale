import React from 'react'
import Link from 'next/link'
import PageShell from '../../../components/layout/page-shell'

export const metadata = {
  title: 'Suporte | Verde Vale',
}

export default function SuportePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Suporte</h1>
          <p className="mt-2 text-white/70">
            Precisa de ajuda? Veja os canais disponíveis para atendimento.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Atendimento comercial</h2>
            <p className="mt-2 text-sm text-white/70">
              Para contratação, mudança de plano e informações comerciais.
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>Horário: segunda a sexta, das 8h às 18h</p>
              <p>Canal principal: formulário de contato</p>
            </div>
            <Link
              href="/contato"
              className="mt-6 inline-flex rounded-xl bg-emerald-500 px-4 py-3 font-medium text-black transition hover:opacity-90"
            >
              Falar com o comercial
            </Link>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Suporte técnico</h2>
            <p className="mt-2 text-sm text-white/70">
              Para instabilidade, lentidão, ausência de conexão e suporte geral.
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>Horário: atendimento conforme disponibilidade operacional</p>
              <p>Antes de abrir chamado, consulte a página de status da rede.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/status"
                className="rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                Ver status da rede
              </Link>
              <Link
                href="/contato"
                className="rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
              >
                Abrir contato
              </Link>
            </div>
          </article>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Antes de solicitar suporte</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75">
            <li>Verifique se há aviso em status da rede.</li>
            <li>Reinicie modem e roteador.</li>
            <li>Teste a conexão em outro dispositivo, se possível.</li>
            <li>Tenha em mãos endereço, bairro e uma forma de contato atualizada.</li>
          </ul>
        </section>
      </section>
    </PageShell>
  )
}