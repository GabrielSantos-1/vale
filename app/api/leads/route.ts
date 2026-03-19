import { NextResponse } from 'next/server'
import { LeadStatus } from '@prisma/client'
import { z, ZodError } from 'zod'

import { prisma } from '@/lib/db/prisma'
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit'

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório').max(120),
  phone: z.string().trim().min(8, 'Telefone obrigatório').max(30),
  city: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(1000).optional().nullable(),
  planSlug: z.string().trim().max(120).optional().nullable(),
})

export async function POST(req: Request) {
  const rl = rateLimit({
    key: buildRateLimitKey('leads', req),
    limit: 5,
    windowMs: 15 * 60 * 1000,
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
    const parsed = leadSchema.parse(body)

    let planId: string | null = null

    if (parsed.planSlug) {
      const plan = await prisma.plan.findUnique({
        where: { slug: parsed.planSlug },
      })

      if (plan) {
        planId = plan.id
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name: parsed.name,
        phone: parsed.phone,
        city: parsed.city ?? null,
        message: parsed.message ?? null,
        planId,
        email: '',
        district: null,
        cep: null,
        source: 'site',
        status: LeadStatus.NOVO,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: lead,
      },
      {
        status: 201,
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
        {
          success: false,
          error: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('ERRO AO CRIAR LEAD:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao salvar lead',
      },
      { status: 500 }
    )
  }
}