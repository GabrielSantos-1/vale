import ContratarClient from './contratar-client'
import { prisma } from '@/lib/db/prisma'

type Props = {
  searchParams: Promise<{
    plano?: string
  }>
}

export default async function ContratarPage({ searchParams }: Props) {
  const params = await searchParams

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [{ featured: 'desc' }, { priceCents: 'asc' }],
  })

  return <ContratarClient plano={params.plano || ''} plans={plans} />
}