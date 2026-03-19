import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import contactSchema from '@/lib/validations/contact'
import { prisma } from '@/lib/db/prisma'
import { buildRateLimitKey, rateLimit } from '@/lib/security/rate-limit'

export async function POST(req: Request) {
  const rl = rateLimit({
    key: buildRateLimitKey('contact', req),
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
    const parsed = contactSchema.parse(body)

    const created = await prisma.contactMessage.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        subject: parsed.subject,
        message: parsed.message,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.id,
        },
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