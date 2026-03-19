import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  badRequestResponse,
  internalErrorResponse,
} from '@/lib/api/responses'
import coverageSchema from '@/lib/validations/coverage'

export async function GET() {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const list = await prisma.coverageArea.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: list })
  } catch {
    return internalErrorResponse('Erro ao buscar cobertura')
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const body = await req.json()
    const parsed = coverageSchema.parse(body)

    const created = await prisma.coverageArea.create({
      data: parsed,
    })

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    )
  } catch (error) {
    const badRequest = badRequestResponse(error)
    if (badRequest) return badRequest

    return internalErrorResponse('Erro interno')
  }
}