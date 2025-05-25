// app/api/usuarios/[id]/route.ts
import { NextRequest } from 'next/server';
import { UsuarioController } from '@/lib/controllers/usuario.controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UsuarioController.getUsuarioById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UsuarioController.updateUsuario(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UsuarioController.deleteUsuario(request, { params });
}