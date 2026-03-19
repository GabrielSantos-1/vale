import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  badRequestResponse,
  conflictResponse,
  internalErrorResponse,
} from '@/lib/api/responses'
import planSchema from '@/lib/validations/plan'

export async function GET() {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: plans })
  } catch {
    return internalErrorResponse('Erro ao buscar planos')
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const body = await req.json()
    const parsed = planSchema.parse(body)

    const created = await prisma.plan.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        downloadMbps: parsed.downloadMbps,
        uploadMbps: parsed.uploadMbps,
        latencyTarget: parsed.latencyTarget,
        priceCents: parsed.priceCents,
        featured: parsed.featured,
        benefitsJson: parsed.benefitsJson as Prisma.InputJsonValue,
        badge: parsed.badge,
      },
    })

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    )
  } catch (error) {
    const badRequest = badRequestResponse(error)
    if (badRequest) return badRequest

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return conflictResponse('Já existe um plano com esse slug.')
    }

    return internalErrorResponse('Erro interno ao criar plano.')
  }
}