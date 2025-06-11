import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth/auth-config"
import { initializeDatabase } from "@/lib/database"
import { PacienteEntity } from "@/entities"
import { Like } from "typeorm"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""

    const dataSource = await initializeDatabase()
    const pacienteRepository = dataSource.getRepository(PacienteEntity)

    const pacientes = await pacienteRepository.find({
      relations: ["persona", "obraSocial"],
      where: [{ persona: { nombre: Like(`%${query}%`) } }, { persona: { apellido: Like(`%${query}%`) } }],
      order: {
        persona: {
          apellido: "ASC",
        },
      },
      take: 10, // Limitar resultados
    })

    const pacientesTransformados = pacientes.map((paciente) => ({
      id: paciente.id,
      persona: {
        nombre: paciente.persona.nombre,
        apellido: paciente.persona.apellido,
        nombreCompleto: `${paciente.persona.nombre} ${paciente.persona.apellido}`,
      },
      obraSocial: {
        nombre: paciente.obraSocial.nombre,
      },
    }))

    return NextResponse.json(pacientesTransformados)
  } catch (error) {
    console.error("Error searching patients:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
