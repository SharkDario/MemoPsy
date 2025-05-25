// src/app/api/permisos/route.ts
import { NextRequest } from 'next/server';
import { PermisoController } from '@/lib/controllers/permiso.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return PermisoController.getAllPermisos(request);
}

export async function POST(request: NextRequest) {
  return PermisoController.createPermiso(request);
}