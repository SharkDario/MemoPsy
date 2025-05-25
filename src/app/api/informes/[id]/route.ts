// src/app/api/informes/[id]/route.ts
import { NextRequest } from 'next/server';
import { InformeController } from '@/lib/controllers/informe.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return InformeController.getInformeById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return InformeController.updateInforme(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return InformeController.deleteInforme(request, { params });
}