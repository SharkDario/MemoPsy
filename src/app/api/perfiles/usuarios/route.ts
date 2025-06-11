import { NextResponse } from "next/server"
import { getRepository } from "@/lib/database"
import { PerfilEntity } from "@/entities"

export async function GET() {
  try {
    const perfilRepo = await getRepository(PerfilEntity)

    const perfiles = await perfilRepo.find({
      order: {
        nombre: "ASC",
      },
    })

    const perfilesResponse = perfiles.map((perfil) => ({
      id: perfil.id,
      nombre: perfil.nombre,
      descripcion: perfil.descripcion,
    }))

    return NextResponse.json(perfilesResponse)
  } catch (error) {
    console.error("Error al obtener perfiles:", error)
    return NextResponse.json({ message: "Error al cargar perfiles" }, { status: 500 })
  }
}
