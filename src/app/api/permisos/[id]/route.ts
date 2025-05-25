// src/app/api/permisos/[id]/route.ts
import { NextRequest } from 'next/server';
import { PermisoController } from '@/lib/controllers/permiso.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PermisoController.getPermisoById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PermisoController.updatePermiso(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PermisoController.deletePermiso(request, { params });
}