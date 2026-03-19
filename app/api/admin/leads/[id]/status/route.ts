import { NextRequest, NextResponse } from 'next/server'
import { LeadStatus } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  internalErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses'

function isValidLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === 'string' &&
    Object.values(LeadStatus).includes(value as LeadStatus)
  )
}

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const status = body?.status

    if (!isValidLeadStatus(status)) {
      return NextResponse.json(
        { success: false, error: 'Status inválido' },
        { status: 400 }
      )
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingLead) {
      return notFoundResponse('Lead não encontrado')
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        archivedAt: status === LeadStatus.ARQUIVADO ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedLead,
    })
  } catch {
    return internalErrorResponse('Erro ao atualizar status do lead')
  }
}