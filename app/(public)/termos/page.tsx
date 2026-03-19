import React from 'react'
import PageShell from '../../../components/layout/page-shell'

export const metadata = {
  title: 'Termos de Uso | Verde Vale',
}

export default function TermosPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Termos de Uso</h1>
          <p className="mt-2 text-sm text-white/70">
            Estes termos regulam o uso do site e dos canais digitais da Verde Vale.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-white/80">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">1. Uso do site</h2>
            <p className="mt-3">
              O site tem finalidade informativa, comercial e de atendimento. O uso dos
              formulários e recursos disponibilizados deve ocorrer de forma legítima,
              sem envio de informações falsas, abusivas ou fraudulentas.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">2. Informações fornecidas</h2>
            <p className="mt-3">
              Ao enviar dados por formulários, o usuário declara que as informações
              fornecidas são verdadeiras, atualizadas e suficientes para contato e
              análise de viabilidade comercial ou técnica.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">3. Disponibilidade dos serviços</h2>
            <p className="mt-3">
              As informações de cobertura, planos, preços e disponibilidade podem ser
              alteradas sem aviso prévio. A contratação efetiva depende de análise
              técnica, comercial e operacional.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">4. Limitação de responsabilidade</h2>
            <p className="mt-3">
              A Verde Vale busca manter o site atualizado e funcional, mas não garante
              ausência total de indisponibilidade, falhas temporárias ou divergências
              eventuais entre o conteúdo publicado e a operação real.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">5. Contato</h2>
            <p className="mt-3">
              Em caso de dúvidas sobre estes termos, utilize os canais disponíveis na
              página de contato.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  )
}