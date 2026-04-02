import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth/auth-options'
import { faqSchema } from '../../../../../lib/validations/faq'
import { prisma } from '../../../../../lib/db/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions as any)

  if (!session || (session as any).user?.role !== 'admin') {
    return null
  }

  return session
}

type Context = {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, context: Context) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params
    const body = await req.json()
    const parsed = faqSchema.parse(body)

    const updated = await prisma.fAQ.update({
      where: { id },
      data: parsed,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    if (err?.errors) {
      return NextResponse.json(
        { success: false, error: err.errors },
        { status: 400 }
      )
    }

    if (err?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'FAQ não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, context: Context) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { id } = await context.params

    await prisma.fAQ.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'FAQ não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}

