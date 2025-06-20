// src/app/api/psicologos/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth/auth-config"
import { initializeDatabase } from "@/lib/database"
import { PsicologoEntity } from "@/entities"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const dataSource = await initializeDatabase()
    const psicologoRepository = dataSource.getRepository(PsicologoEntity)

    const psicologos = await psicologoRepository.find({
      relations: ["persona"],
      order: {
        persona: {
          apellido: "ASC",
        },
      },
    })

    const psicologosTransformados = psicologos.map((psicologo) => ({
      id: psicologo.id,
      especialidad: psicologo.especialidad,
      numeroLicencia: psicologo.numeroLicencia,
      persona: {
        nombre: psicologo.persona.nombre,
        apellido: psicologo.persona.apellido,
      },
    }))

    return NextResponse.json(psicologosTransformados)
  } catch (error) {
    console.error("Error fetching psychologists:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/*
import { NextRequest } from 'next/server';
import { PsicologoController } from '@/lib/controllers/psicologo.controller';

export async function GET(request: NextRequest) {
  return PsicologoController.getAllPsicologos(request);
}

export async function POST(request: NextRequest) {
  return PsicologoController.createPsicologo(request);
}
  */