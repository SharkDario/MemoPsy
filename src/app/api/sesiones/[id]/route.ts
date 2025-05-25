// src/app/api/sesiones/[id]/route.ts
import { NextRequest } from 'next/server';
import { SesionController } from '@/lib/controllers/sesion.controller';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return SesionController.getSesionById(request, { params });
}