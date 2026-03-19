import { prisma } from '../../../lib/db/prisma'

export const metadata = {
  title: 'Dashboard - Admin',
}

export default async function DashboardPage() {
  const [
    totalPlans,
    totalLeads,
    totalCoverageAreas,
    totalFaqs,
    totalVisibleStatus,
    totalContactMessages,
  ] = await Promise.all([
    prisma.plan.count(),
    prisma.lead.count(),
    prisma.coverageArea.count(),
    prisma.fAQ.count(),
    prisma.networkStatus.count({ where: { isVisible: true } }),
    prisma.contactMessage.count(),
  ])

  const cards = [
    { label: 'Planos', value: totalPlans },
    { label: 'Leads', value: totalLeads },
    { label: 'Cobertura', value: totalCoverageAreas },
    { label: 'FAQs', value: totalFaqs },
    { label: 'Status visíveis', value: totalVisibleStatus },
    { label: 'Mensagens', value: totalContactMessages },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="mt-2 text-sm text-white/70">
            Visão geral inicial do painel administrativo.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg"
            >
              <p className="text-sm text-white/70">{card.label}</p>
              <p className="mt-3 text-3xl font-bold">{card.value}</p>
            </article>
          ))}
        </section>

       <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
         <h2 className="text-xl font-semibold">Próximos passos</h2>
         <p className="mt-2 text-sm text-white/70">
           O núcleo administrativo já está funcional. O próximo passo recomendado é
           refinar a experiência do painel com listagens recentes, atalhos operacionais
           e métricas comerciais mais detalhadas.
         </p>
       </section>
      </div>
    </main>
  )
}