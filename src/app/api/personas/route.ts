// src/app/api/personas/route.ts
import { NextRequest } from 'next/server';
import { PersonaController } from '@/lib/controllers/persona.controller';

export async function GET(request: NextRequest) {
  return PersonaController.getAllPersonas(request);
}

export async function POST(request: NextRequest) {
  return PersonaController.createPersona(request);
}
