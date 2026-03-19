import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  badRequestResponse,
  internalErrorResponse,
} from '@/lib/api/responses'
import statusSchema from '@/lib/validations/status'

export async function GET() {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const items = await prisma.networkStatus.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: items })
  } catch {
    return internalErrorResponse('Erro ao buscar status')
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const body = await req.json()
    const parsed = statusSchema.parse(body)

    const created = await prisma.networkStatus.create({
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