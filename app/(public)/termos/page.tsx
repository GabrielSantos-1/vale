import React from 'react'
import PageShell from '../../../components/layout/public/page-shell'

export const metadata = {
  title: 'Termos de Uso | Verde Vale Connect',
}

export default function TermosPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Termos de Uso</h1>
          <p className="mt-2 text-sm text-secondary/70">
            Estes termos regulam o uso do site e dos canais digitais da Verde Vale Connect.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-secondary/80">
          <section className="rounded-2xl border border-border bg-surface-secondary p-6">
            <h2 className="text-xl font-semibold text-primary">1. Uso do site</h2>
            <p className="mt-3">
              O site tem finalidade informativa, comercial e de atendimento. O uso dos
              formulÃ¡rios e recursos disponibilizados deve ocorrer de forma legÃ­tima,
              sem envio de informaÃ§Ãµes falsas, abusivas ou fraudulentas.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-primary">2. InformaÃ§Ãµes fornecidas</h2>
            <p className="mt-3">
              Ao enviar dados por formulÃ¡rios, o usuÃ¡rio declara que as informaÃ§Ãµes
              fornecidas sÃ£o verdadeiras, atualizadas e suficientes para contato e
              anÃ¡lise de viabilidade comercial ou tÃ©cnica.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-primary">3. Disponibilidade dos serviÃ§os</h2>
            <p className="mt-3">
              As informaÃ§Ãµes de cobertura, planos, preÃ§os e disponibilidade podem ser
              alteradas sem aviso prÃ©vio. A contrataÃ§Ã£o efetiva depende de anÃ¡lise
              tÃ©cnica, comercial e operacional.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">4. LimitaÃ§Ã£o de responsabilidade</h2>
            <p className="mt-3">
              A Verde Vale Connect busca manter o site atualizado e funcional, mas nÃ£o garante
              ausÃªncia total de indisponibilidade, falhas temporÃ¡rias ou divergÃªncias
              eventuais entre o conteÃºdo publicado e a operaÃ§Ã£o real.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">5. Contato</h2>
            <p className="mt-3">
              Em caso de dÃºvidas sobre estes termos, utilize os canais disponÃ­veis na
              pÃ¡gina de contato.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  )
}

