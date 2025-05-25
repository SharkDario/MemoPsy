// src/app/api/perfiles/route.ts
import { NextRequest } from 'next/server';
import { PerfilController } from '@/lib/controllers/perfil.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return PerfilController.getAllPerfiles(request);
}

export async function POST(request: NextRequest) {
  return PerfilController.createPerfil(request);
}