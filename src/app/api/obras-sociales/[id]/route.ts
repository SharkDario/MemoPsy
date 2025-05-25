// src/app/api/obras-sociales/[id]/route.ts
import { NextRequest } from 'next/server';
import { ObraSocialController } from '@/lib/controllers/obra-social.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ObraSocialController.getObraSocialById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ObraSocialController.updateObraSocial(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return ObraSocialController.deleteObraSocial(request, { params });
}