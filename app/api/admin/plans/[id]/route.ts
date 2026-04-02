import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  badRequestResponse,
  conflictResponse,
  internalErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses'
import planSchema from '@/lib/validations/plan'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params

    await prisma.plan.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Plano removido com sucesso.',
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return notFoundResponse('Plano não encontrado.')
    }

    return internalErrorResponse('Erro ao remover plano.')
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params
    const body = await req.json()
    const parsed = planSchema.parse(body)

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        downloadMbps: parsed.downloadMbps,
        uploadMbps: parsed.uploadMbps,
        latencyTarget: parsed.latencyTarget,
        priceCents: parsed.priceCents,
        featured: parsed.featured,
        benefitsJson: Array.isArray(parsed.benefitsJson)
          ? parsed.benefitsJson.filter((item) => typeof item === 'string')
          : [],
        badge: parsed.badge,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    const badRequest = badRequestResponse(error)
    if (badRequest) return badRequest

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return conflictResponse('Já existe um plano com esse slug.')
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return notFoundResponse('Plano não encontrado.')
    }

    return internalErrorResponse('Erro ao atualizar plano.')
  }
}
