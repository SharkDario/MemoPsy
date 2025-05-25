// src/app/api/estados/route.ts
import { NextRequest } from 'next/server';
import { EstadoController } from '@/lib/controllers/estado.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return EstadoController.getAllEstados(request);
}

export async function POST(request: NextRequest) {
  return EstadoController.createEstado(request);
}