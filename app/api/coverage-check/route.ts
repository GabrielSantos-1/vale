import { NextResponse } from 'next/server'
import { ZodError, z } from 'zod'

import { prisma } from '@/lib/db/prisma'
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit'

const coverageCheckSchema = z.object({
  cep: z.string().trim().optional(),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
})

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 8)
}

export async function POST(req: Request) {
  const rl = rateLimit({
    key: buildRateLimitKey('coverage-check', req),
    limit: 20,
    windowMs: 5 * 60 * 1000,
  })

  if (!rl.ok) {
    return NextResponse.json(
      {
        success: false,
        error: 'Muitas requisições. Tente novamente em instantes.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfter),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    )
  }

  try {
    const body = await req.json()
    const parsed = coverageCheckSchema.parse(body)

    const cep = parsed.cep ? normalizeCep(parsed.cep) : ''
    const city = parsed.city?.trim() || ''
    const district = parsed.district?.trim() || ''

    if (!cep && !city && !district) {
      return NextResponse.json(
        { success: false, error: 'Informe ao menos CEP, cidade ou bairro' },
        { status: 400 }
      )
    }

    let found = null

    if (cep) {
      found = await prisma.coverageArea.findFirst({
        where: {
          isAvailable: true,
          cepStart: { lte: cep },
          cepEnd: { gte: cep },
        },
      })
    } else if (city && district) {
      found = await prisma.coverageArea.findFirst({
        where: {
          isAvailable: true,
          city: {
            equals: city,
            mode: 'insensitive',
          },
          district: {
            equals: district,
            mode: 'insensitive',
          },
        },
      })
    } else if (city) {
      found = await prisma.coverageArea.findFirst({
        where: {
          isAvailable: true,
          city: {
            equals: city,
            mode: 'insensitive',
          },
        },
      })
    }

    if (!found) {
      return NextResponse.json(
        {
          success: true,
          data: {
            available: false,
            notes: null,
          },
        },
        {
          headers: {
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': String(rl.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
          },
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          available: found.isAvailable,
          notes: found.notes,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}