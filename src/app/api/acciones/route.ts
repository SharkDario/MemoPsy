// src/app/api/acciones/route.ts
import { NextRequest } from 'next/server';
import { AccionController } from '@/lib/controllers/accion.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return AccionController.getAllAcciones(request);
}

export async function POST(request: NextRequest) {
  return AccionController.createAccion(request);
}