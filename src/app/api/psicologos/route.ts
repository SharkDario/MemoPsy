// src/app/api/psicologos/route.ts
import { NextRequest } from 'next/server';
import { PsicologoController } from '@/lib/controllers/psicologo.controller';

export async function GET(request: NextRequest) {
  return PsicologoController.getAllPsicologos(request);
}

export async function POST(request: NextRequest) {
  return PsicologoController.createPsicologo(request);
}