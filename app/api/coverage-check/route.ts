import { NextResponse } from 'next/server'
import coverageSchema from '../../../lib/validations/coverage'
import { prisma } from '../../../lib/db/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = coverageSchema.parse(body)

    const { cep, city, district } = parsed

    const whereClauses: any[] = []
    if (city) whereClauses.push({ city })
    if (district) whereClauses.push({ district })
    if (cep) whereClauses.push({ cepStart: { lte: cep }, cepEnd: { gte: cep } })

    const found = await prisma.coverageArea.findFirst({ where: { OR: whereClauses } })

    if (!found) {
      return NextResponse.json({ success: true, data: { available: false } })
    }

    return NextResponse.json({ success: true, data: { available: found.isAvailable, notes: found.notes } })
  } catch (err: any) {
    if (err?.errors) return NextResponse.json({ success: false, error: err.errors }, { status: 400 })
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

