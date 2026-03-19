import { NextResponse } from 'next/server'
import { LeadStatus } from '@prisma/client'

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

export async function PATCH(_request: Request, context: RouteContext) {
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

    const archivedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.ARQUIVADO,
        archivedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: archivedLead,
    })
  } catch {
    return internalErrorResponse('Erro ao arquivar lead')
  }
}