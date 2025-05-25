// src/app/api/obras-sociales/route.ts
import { NextRequest } from 'next/server';
import { ObraSocialController } from '@/lib/controllers/obra-social.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return ObraSocialController.getAllObrasSociales(request);
}

export async function POST(request: NextRequest) {
  return ObraSocialController.createObraSocial(request);
}
