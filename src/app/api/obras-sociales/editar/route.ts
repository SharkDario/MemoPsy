import { NextResponse } from "next/server"
import { getRepository } from "@/lib/database"
import { ObraSocialEntity } from "@/entities"

export async function GET() {
  try {
    const obraSocialRepo = await getRepository(ObraSocialEntity)

    const obrasSociales = await obraSocialRepo.find({
      where: { activo: true },
      order: {
        nombre: "ASC",
      },
    })

    const obrasSocialesResponse = obrasSociales.map((obra) => ({
      id: obra.id,
      nombre: obra.nombre,
      activo: obra.activo,
    }))

    return NextResponse.json(obrasSocialesResponse)
  } catch (error) {
    console.error("Error al obtener obras sociales:", error)
    return NextResponse.json({ message: "Error al cargar obras sociales" }, { status: 500 })
  }
}
