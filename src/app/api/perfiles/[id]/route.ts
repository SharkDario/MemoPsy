// src/app/api/perfiles/[id]/route.ts
import { NextRequest } from 'next/server';
import { PerfilController } from '@/lib/controllers/perfil.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PerfilController.getPerfilById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PerfilController.updatePerfil(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PerfilController.deletePerfil(request, { params });
}