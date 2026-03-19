import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default async function Home() {
  const [plans, faqs, visibleStatus] = await Promise.all([
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ featured: 'desc' }, { priceCents: 'asc' }],
      take: 3,
    }),
    prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    prisma.networkStatus.findMany({
      where: { isVisible: true },
      orderBy: { startedAt: 'desc' },
      take: 3,
    }),
  ])

  return (
    <section className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-10 shadow-xl md:px-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,65,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_35%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Provedor digital
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
              Internet fibra com foco em cobertura, transparência e atendimento
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary md:text-base">
              Consulte planos, valide disponibilidade na sua região, acompanhe o
              status da rede e fale com a equipe em um portal único.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/planos"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Ver planos
              </Link>

              <Link
                href="/contratar"
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/5"
              >
                Solicitar contratação
              </Link>

              <Link
                href="/cobertura"
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/5"
              >
                Consultar cobertura
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-wide text-secondary">
                Planos em destaque
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">{plans.length}</p>
              <p className="mt-2 text-sm text-secondary">
                Ofertas carregadas dinamicamente do sistema.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-wide text-secondary">
                FAQs públicas
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">{faqs.length}</p>
              <p className="mt-2 text-sm text-secondary">
                Base de dúvidas visível para navegação rápida.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-wide text-secondary">
                Avisos operacionais
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {visibleStatus.length}
              </p>
              <p className="mt-2 text-sm text-secondary">
                Transparência sobre incidentes e manutenção.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-primary">Cobertura consultável</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            O cliente consegue verificar disponibilidade por CEP, cidade ou bairro.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-primary">Contratação simplificada</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Leads comerciais são capturados diretamente pelo site com fluxo objetivo.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-primary">Status público da rede</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            Avisos visíveis reforçam confiança e transparência operacional.
          </p>
        </article>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primary">Planos em destaque</h2>
            <p className="mt-1 text-sm text-secondary">
              Algumas das ofertas atualmente disponíveis no sistema.
            </p>
          </div>

          <Link
            href="/planos"
            className="text-sm font-medium text-accent transition hover:opacity-80"
          >
            Ver todos os planos
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-secondary">Nenhum plano disponível no momento.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-white/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{plan.name}</h3>
                    <p className="mt-1 text-sm text-secondary">{plan.slug}</p>
                  </div>

                  {plan.featured ? (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Destaque
                    </span>
                  ) : null}
                </div>

                <div className="mt-6">
                  <p className="text-sm text-secondary">Preço mensal</p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    {formatPrice(plan.priceCents)}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-secondary">Download</p>
                    <p className="mt-1 font-medium text-primary">
                      {plan.downloadMbps} Mbps
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-secondary">Upload</p>
                    <p className="mt-1 font-medium text-primary">
                      {plan.uploadMbps} Mbps
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-xs text-secondary">Latência</p>
                    <p className="mt-1 font-medium text-primary">
                      {plan.latencyTarget} ms
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/contratar?plano=${plan.slug}`}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Contratar
                  </Link>

                  <Link
                    href="/planos"
                    className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-white/5"
                  >
                    Ver mais
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-primary">Perguntas frequentes</h2>
            <p className="mt-1 text-sm text-secondary">
              Dúvidas comuns respondidas diretamente no site.
            </p>
          </div>

          {faqs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-secondary">
                Nenhuma pergunta frequente publicada no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <article
                  key={faq.id}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <h3 className="text-lg font-semibold text-primary">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-secondary">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Status da rede</h2>
              <p className="mt-1 text-sm text-secondary">
                Avisos visíveis e atualizações operacionais.
              </p>
            </div>

            <Link
              href="/status"
              className="text-sm font-medium text-accent transition hover:opacity-80"
            >
              Ver página completa
            </Link>
          </div>

          {visibleStatus.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-secondary">
                Nenhum incidente ou manutenção visível no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleStatus.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-secondary">
                      {item.status}
                    </span>
                  </div>

                  {item.description ? (
                    <p className="mt-3 text-sm leading-7 text-secondary">
                      {item.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-primary">
              Pronto para verificar disponibilidade ou contratar?
            </h2>
            <p className="mt-2 text-sm leading-7 text-secondary">
              Use as páginas públicas do sistema para consultar cobertura, analisar
              os planos e enviar sua solicitação de forma rápida.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cobertura"
              className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/5"
            >
              Consultar cobertura
            </Link>

            <Link
              href="/contratar"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Solicitar contratação
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}