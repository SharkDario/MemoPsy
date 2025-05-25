// app/api/usuarios/[id]/toggle-status/route.ts
import { NextRequest } from 'next/server';
import { UsuarioController } from '@/lib/controllers/usuario.controller';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UsuarioController.toggleUsuarioStatus(request, { params });
}