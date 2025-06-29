// src/app/api/pacientes/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth/auth-config"
import { initializeDatabase } from "@/lib/database"
import { PacienteEntity } from "@/entities"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const dataSource = await initializeDatabase()
    const pacienteRepository = dataSource.getRepository(PacienteEntity)

    const pacientes = await pacienteRepository.find({
      relations: ["persona", "obraSocial"],
      order: {
        persona: {
          apellido: "ASC",
        },
      },
    })

    const pacientesTransformados = pacientes.map((paciente) => ({
      id: paciente.id,
      persona: {
        nombre: paciente.persona.nombre,
        apellido: paciente.persona.apellido,
      },
      obraSocial: {
        nombre: paciente.obraSocial.nombre,
      },
    }))

    return NextResponse.json(pacientesTransformados)
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/*
import { NextRequest } from 'next/server';
import { PacienteController } from '@/lib/controllers/paciente.controller'; // Adjust path if needed

export async function GET(request: NextRequest) {
  return PacienteController.getAllPacientes(request);
}

export async function POST(request: NextRequest) {
  return PacienteController.createPaciente(request);
}
  */