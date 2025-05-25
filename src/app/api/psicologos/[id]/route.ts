// src/app/api/psicologos/[id]/route.ts
import { NextRequest } from 'next/server';
import { PsicologoController } from '@/lib/controllers/psicologo.controller';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return PsicologoController.getPsicologoById(request, { params });
}