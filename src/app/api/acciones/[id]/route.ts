// src/app/api/acciones/[id]/route.ts
import { NextRequest } from 'next/server';
import { AccionController } from '@/lib/controllers/accion.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return AccionController.getAccionById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return AccionController.updateAccion(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return AccionController.deleteAccion(request, { params });
}