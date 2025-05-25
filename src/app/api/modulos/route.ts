// src/app/api/modulos/route.ts
import { NextRequest } from 'next/server';
import { ModuloController } from '@/lib/controllers/modulo.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return ModuloController.getAllModulos(request);
}

export async function POST(request: NextRequest) {
  return ModuloController.createModulo(request);
}
