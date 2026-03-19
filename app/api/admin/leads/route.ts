import { NextRequest, NextResponse } from 'next/server'
import { LeadStatus } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  internalErrorResponse,
} from '@/lib/api/responses'

function isValidLeadStatus(value: string | null): value is LeadStatus {
  if (!value) return false
  return Object.values(LeadStatus).includes(value as LeadStatus)
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')

    const whereClause: {
      deletedAt: null
      status?: LeadStatus
    } = {
      deletedAt: null,
    }

    if (statusParam && statusParam !== 'ALL') {
      if (!isValidLeadStatus(statusParam)) {
        return NextResponse.json(
          { success: false, error: 'Status inválido' },
          { status: 400 }
        )
      }

      whereClause.status = statusParam
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: leads,
    })
  } catch {
    return internalErrorResponse('Erro ao buscar leads')
  }
}