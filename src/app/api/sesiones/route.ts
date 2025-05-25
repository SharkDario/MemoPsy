// src/app/api/sesiones/route.ts
import { NextRequest } from 'next/server';
import { SesionController } from '@/lib/controllers/sesion.controller';

export async function GET(request: NextRequest) {
  return SesionController.getAllSesiones(request);
}

export async function POST(request: NextRequest) {
  return SesionController.createSesion(request);
}