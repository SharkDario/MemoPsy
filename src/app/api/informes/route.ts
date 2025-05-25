// src/app/api/informes/route.ts
import { NextRequest } from 'next/server';
import { InformeController } from '@/lib/controllers/informe.controller';

export async function GET(request: NextRequest) {
  return InformeController.getAllInformes(request);
}

export async function POST(request: NextRequest) {
  return InformeController.createInforme(request);
}
