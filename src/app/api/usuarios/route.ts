// app/api/usuarios/route.ts
import { NextRequest } from 'next/server';
import { UsuarioController } from '@/lib/controllers/usuario.controller';

export async function GET(request: NextRequest) {
  return UsuarioController.getAllUsuarios(request);
}

export async function POST(request: NextRequest) {
  return UsuarioController.createUsuario(request);
}