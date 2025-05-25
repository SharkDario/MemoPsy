// src/app/api/pacientes/route.ts
import { NextRequest } from 'next/server';
import { PacienteController } from '@/lib/controllers/paciente.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return PacienteController.getAllPacientes(request);
}

export async function POST(request: NextRequest) {
  return PacienteController.createPaciente(request);
}