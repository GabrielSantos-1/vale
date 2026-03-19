import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'unauthorized' },
    { status: 401 }
  )
}

export function badRequestResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: error.issues },
      { status: 400 }
    )
  }

  return null
}

export function notFoundResponse(message = 'Registro não encontrado') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  )
}

export function conflictResponse(message = 'Conflito de dados') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 409 }
  )
}

export function internalErrorResponse(message = 'Erro interno') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  )
}

export function handlePrismaKnownError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return conflictResponse('Registro duplicado.')
    }

    if (error.code === 'P2025') {
      return notFoundResponse()
    }
  }

  return null
}