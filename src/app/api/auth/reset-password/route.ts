// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server"
import { getRepository } from "@/lib/database"
import { UsuarioEntity } from "@/entities"
import * as bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const { email, newPassword, timestamp, expires } = await request.json()

    // Validar que todos los campos requeridos estén presentes
    if (!email || !newPassword || !timestamp || !expires) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar que el enlace no haya expirado
    const currentTime = Date.now()
    const expirationTime = Number.parseInt(expires)

    if (currentTime > expirationTime) {
      return NextResponse.json({ message: "El enlace ha expirado" }, { status: 400 })
    }

    // Buscar al usuario por email usando TypeORM
    const usuarioRepo = await getRepository(UsuarioEntity)
    const usuario = await usuarioRepo.findOne({
      where: { email },
    })

    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña del usuario
    usuario.password = hashedPassword
    usuario.ultimoAcceso = new Date() // Actualizar la fecha de último acceso

    await usuarioRepo.save(usuario)

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar contraseña:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
