// app/api/usuarios/me/route.ts
import { NextRequest } from 'next/server';
import { UsuarioController } from '@/lib/controllers/usuario.controller';

export async function GET(request: NextRequest) {
  return UsuarioController.getCurrentUser(request);
}