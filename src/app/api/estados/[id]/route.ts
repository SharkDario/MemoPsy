// src/app/api/estados/[id]/route.ts
import { NextRequest } from 'next/server';
import { EstadoController } from '@/lib/controllers/estado.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return EstadoController.getEstadoById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return EstadoController.updateEstado(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return EstadoController.deleteEstado(request, { params });
}
