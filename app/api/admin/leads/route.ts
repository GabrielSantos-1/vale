import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '../../../../lib/auth/auth-options'
import { prisma } from '../../../../lib/db/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions as any)
  if (!session || (session as any).user?.role !== 'admin') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  const items = await prisma.lead.findMany()
  return NextResponse.json({ success: true, data: items })
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    // For admin creation of leads we accept same shape as Lead model
    const created = await prisma.lead.create({ data: body as any })
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

