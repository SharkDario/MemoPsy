// src/app/api/modalidades/[id]/route.ts
import { NextRequest } from 'next/server';
import { ModalidadController } from '@/lib/controllers/modalidad.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ModalidadController.getModalidadById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ModalidadController.updateModalidad(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ModalidadController.deleteModalidad(request, { params });
}