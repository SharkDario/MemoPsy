// app/api/usuarios/[id]/change-password/route.ts
import { NextRequest } from 'next/server';
import { UsuarioController } from '@/lib/controllers/usuario.controller';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return UsuarioController.changePassword(request, { params });
}