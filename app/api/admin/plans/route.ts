import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '../../../../lib/auth/auth-options'
import planSchema from '../../../../lib/validations/plan'
import { prisma } from '../../../../lib/db/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })

  const plans = await prisma.plan.findMany()
  return NextResponse.json({ success: true, data: plans })
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = planSchema.parse(body)
    const created = await prisma.plan.create({ data: parsed })
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: any) {
    if (err?.errors) return NextResponse.json({ success: false, error: err.errors }, { status: 400 })
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

