import { prisma } from '@/lib/db/prisma'
import CoberturaClient from './cobertura-client'

export default async function CoberturaPage() {
  const areas = await prisma.coverageArea.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: [{ city: 'asc' }, { district: 'asc' }],
  })

  return <CoberturaClient areas={areas} />
}