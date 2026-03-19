import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/api/admin'
import {
  unauthorizedResponse,
  badRequestResponse,
  internalErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses'
import statusSchema from '@/lib/validations/status'

type Context = {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, context: Context) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params
    const body = await req.json()
    const parsed = statusSchema.parse(body)

    const updated = await prisma.networkStatus.update({
      where: { id },
      data: parsed,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    const badRequest = badRequestResponse(error)
    if (badRequest) return badRequest

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return notFoundResponse('Registro de status não encontrado')
    }

    return internalErrorResponse('Erro interno')
  }
}

export async function DELETE(_req: Request, context: Context) {
  const session = await requireAdmin()

  if (!session) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await context.params

    await prisma.networkStatus.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return notFoundResponse('Registro de status não encontrado')
    }

    return internalErrorResponse('Erro interno')
  }
}