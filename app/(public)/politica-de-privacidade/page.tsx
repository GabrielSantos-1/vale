import React from 'react'
import PageShell from '../../../components/layout/public/page-shell'

export const metadata = {
  title: 'Política de Privacidade | Verde Vale',
}

export default function PoliticaPrivacidadePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="mt-2 text-sm text-secondary/70">
            Entenda como os dados enviados pelo site podem ser utilizados.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-7 text-secondary/80">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">1. Dados coletados</h2>
            <p className="mt-3">
              Podemos coletar dados informados pelo usuário em formulários, como nome,
              telefone, e-mail, cidade, bairro, CEP e mensagens enviadas para contato,
              contratação ou suporte.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface-secondary p-6">
            <h2 className="text-xl font-semibold">2. Finalidade do uso</h2>
            <p className="mt-3">
              Os dados podem ser utilizados para retorno comercial, atendimento,
              verificação de cobertura, análise de interesse em planos, suporte técnico
              e melhoria da operação dos canais digitais.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">3. Compartilhamento</h2>
            <p className="mt-3">
              Os dados não devem ser compartilhados além do necessário para a execução
              das atividades operacionais, comerciais e técnicas vinculadas ao
              atendimento do usuário, respeitada a legislação aplicável.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">4. Armazenamento e segurança</h2>
            <p className="mt-3">
              São adotadas medidas técnicas e organizacionais razoáveis para reduzir
              riscos de acesso indevido, perda ou uso inadequado das informações
              tratadas pelo sistema.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">5. Direitos do titular</h2>
            <p className="mt-3">
              O titular pode solicitar informações, correções ou esclarecimentos sobre
              o tratamento de dados por meio dos canais oficiais de contato.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  )
}