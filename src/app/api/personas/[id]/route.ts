// src/app/api/personas/[id]/route.ts
import { NextRequest } from 'next/server';
import { PersonaController } from '@/lib/controllers/persona.controller';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return PersonaController.getPersonaById(request, { params });
}
