import { NextResponse } from 'next/server'
import { leadSchema } from '../../../lib/validations/lead'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = leadSchema.parse(body)

    const created = await prisma.lead.create({ data: parsed })

    return NextResponse.json({ success: true, data: { id: created.id } }, { status: 201 })
  } catch (err: any) {
    if (err?.errors) {
      return NextResponse.json({ success: false, error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

