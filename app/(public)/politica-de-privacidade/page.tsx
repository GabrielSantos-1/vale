import React from 'react'
import PageShell from '../../../components/layout/public/page-shell'

export const metadata = {
  title: 'PolÃ­tica de Privacidade | Verde Vale Connect',
}

export default function PoliticaPrivacidadePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">PolÃ­tica de Privacidade</h1>
          <p className="mt-2 text-sm text-secondary/70">
            Entenda como os dados enviados pelo site podem ser utilizados.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-secondary/80">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">1. Dados coletados</h2>
            <p className="mt-3">
              Podemos coletar dados informados pelo usuÃ¡rio em formulÃ¡rios, como nome,
              telefone, e-mail, cidade, bairro, CEP e mensagens enviadas para contato,
              contrataÃ§Ã£o ou suporte.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface-secondary p-6">
            <h2 className="text-xl font-semibold">2. Finalidade do uso</h2>
            <p className="mt-3">
              Os dados podem ser utilizados para retorno comercial, atendimento,
              verificaÃ§Ã£o de cobertura, anÃ¡lise de interesse em planos, suporte tÃ©cnico
              e melhoria da operaÃ§Ã£o dos canais digitais.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">3. Compartilhamento</h2>
            <p className="mt-3">
              Os dados nÃ£o devem ser compartilhados alÃ©m do necessÃ¡rio para a execuÃ§Ã£o
              das atividades operacionais, comerciais e tÃ©cnicas vinculadas ao
              atendimento do usuÃ¡rio, respeitada a legislaÃ§Ã£o aplicÃ¡vel.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">4. Armazenamento e seguranÃ§a</h2>
            <p className="mt-3">
              SÃ£o adotadas medidas tÃ©cnicas e organizacionais razoÃ¡veis para reduzir
              riscos de acesso indevido, perda ou uso inadequado das informaÃ§Ãµes
              tratadas pelo sistema.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">5. Direitos do titular</h2>
            <p className="mt-3">
              O titular pode solicitar informaÃ§Ãµes, correÃ§Ãµes ou esclarecimentos sobre
              o tratamento de dados por meio dos canais oficiais de contato.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  )
}

