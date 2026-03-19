import React from 'react'
import PageShell from '../../../components/layout/page-shell'

export const metadata = {
  title: 'Sobre | Verde Vale',
}

export default function SobrePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Sobre</h1>
          <p className="mt-2 text-sm text-white/70">
            Conheça um pouco mais sobre a Verde Vale e nossa proposta de atendimento.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-white/80">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Nossa proposta</h2>
            <p className="mt-3">
              A Verde Vale busca oferecer conectividade com foco em atendimento,
              estabilidade operacional e clareza nas informações apresentadas ao
              cliente.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">O que oferecemos</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Planos de internet com diferentes perfis de velocidade.</li>
              <li>Consulta de cobertura por região.</li>
              <li>Status de rede para transparência operacional.</li>
              <li>Canais de contato para suporte e atendimento comercial.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Compromisso</h2>
            <p className="mt-3">
              Nosso compromisso é evoluir continuamente a experiência digital e os
              processos de atendimento, integrando informação pública, operação
              administrativa e captação de leads em uma única plataforma.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  )
}