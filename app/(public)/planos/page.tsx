import React from 'react'
import Link from 'next/link'
import PageShell from '../../../components/layout/page-shell'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Planos | Verde Vale',
}

export const dynamic = 'force-dynamic'

function formatPrice(priceCents: number) {
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default async function PlanosPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [
      { featured: 'desc' },
      { priceCents: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Planos</h1>
          <p className="mt-2 text-white/70">
            Escolha o plano ideal para sua casa ou empresa.
          </p>
        </header>

        {plans.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/70">
              Nenhum plano disponível no momento.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const benefits: string[] = Array.isArray(plan.benefitsJson)
              ? plan.benefitsJson.filter(
                  (item): item is string => typeof item === 'string'
                )
              : []

            return (
              <article
                key={plan.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{plan.name}</h2>
                    <p className="text-sm text-white/60">{plan.slug}</p>
                  </div>

                  {plan.featured && (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                      Destaque
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-sm text-white/60">Preço mensal</p>
                  <p className="text-3xl font-bold">
                    {formatPrice(plan.priceCents)}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="card-info">
                    <p className="text-xs text-white/50">Download</p>
                    <p>{plan.downloadMbps} Mbps</p>
                  </div>

                  <div className="card-info">
                    <p className="text-xs text-white/50">Upload</p>
                    <p>{plan.uploadMbps} Mbps</p>
                  </div>

                  <div className="card-info">
                    <p className="text-xs text-white/50">Latência</p>
                    <p>{plan.latencyTarget} ms</p>
                  </div>
                </div>

                {benefits.length > 0 && (
                  <ul className="mt-6 list-disc space-y-1 text-sm text-white/75">
                    {benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/contratar?plano=${plan.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-medium text-black transition hover:opacity-90"
                >
                  Contratar
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}