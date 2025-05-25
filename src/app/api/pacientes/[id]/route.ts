// src/app/api/pacientes/[id]/route.ts
import { NextRequest } from 'next/server';
import { PacienteController } from '@/lib/controllers/paciente.controller'; // Adjust path if needed

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PacienteController.getPacienteById(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PacienteController.updatePaciente(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PacienteController.deletePaciente(request, { params });
}