import React from 'react'
import PageShell from '../../../components/layout/page-shell'
import { prisma } from '@/lib/db/prisma'

export default async function Status() {

  const incidents = await prisma.networkStatus.findMany({
    where: {
      isVisible: true
    },
    orderBy: {
      startedAt: 'desc'
    }
  })

  return (
    <PageShell>

      <h1 className="text-2xl font-semibold">
        Status da Rede
      </h1>

      <p className="text-secondary mt-2">
        Acompanhe incidentes, manutenções e avisos operacionais.
      </p>

      <div className="mt-6 space-y-4">

        {incidents.length === 0 && (
          <p className="text-sm text-secondary">
            Nenhum incidente ou manutenção no momento.
          </p>
        )}

        {incidents.map(item => (
          <div
            key={item.id}
            className="border border-white/10 rounded-lg p-4"
          >

            <div className="flex justify-between items-center">

              <h3 className="font-medium">
                {item.title}
              </h3>

              <span className="text-xs px-2 py-1 rounded bg-white/10">
                {item.status}
              </span>

            </div>

            {item.description && (
              <p className="text-sm mt-2 text-secondary">
                {item.description}
              </p>
            )}

            <div className="text-xs text-secondary mt-3">

              <div>
                Início: {item.startedAt?.toLocaleString()}
              </div>

              {item.resolvedAt && (
                <div>
                  Resolução: {item.resolvedAt.toLocaleString()}
                </div>
              )}

            </div>

          </div>
        ))}

      </div>

    </PageShell>
  )
}