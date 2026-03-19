import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  internalErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params

    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingLead) {
      return notFoundResponse('Lead não encontrado')
    }

    const deletedLead = await prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: deletedLead,
    })
  } catch {
    return internalErrorResponse('Erro ao excluir lead')
  }
}