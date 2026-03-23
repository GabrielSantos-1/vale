import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da mensagem é obrigatório' },
        { status: 400 },
      );
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error('GET /api/admin/contact/[id] error:', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar mensagem' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da mensagem é obrigatório' },
        { status: 400 },
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status é obrigatório' },
        { status: 400 },
      );
    }

    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 },
      );
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/admin/contact/[id] error:', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar mensagem' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da mensagem é obrigatório' },
        { status: 400 },
      );
    }

    const existing = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 },
      );
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/contact/[id] error:', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao excluir mensagem' },
      { status: 500 },
    );
  }
}
