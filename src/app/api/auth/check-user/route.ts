// app/api/auth/check-user/route.ts
import { NextResponse } from "next/server"
import { getRepository } from "@/lib/database"
import { UsuarioEntity } from "@/entities"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe en la base de datos usando TypeORM
    const usuarioRepo = await getRepository(UsuarioEntity)
    const usuario = await usuarioRepo.findOne({
      where: { email },
      select: ["id", "email", "activo"], // Solo seleccionar campos necesarios
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 })
    }

    // Si el usuario existe y está activo, devolver éxito
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al verificar usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
/*


import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services';
import { UsuarioRepository, PersonaRepository } from '@/repositories';
import { AppDataSource } from '@/lib/database';
// Importa tu servicio/repositorio de Usuario aquí
// import { UsuarioService } from '@/services/UsuarioService';

export async function POST(request: NextRequest) {
  try {
    // Comprobar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Aquí deberías verificar si el usuario existe en tu base de datos
    // usando tu modelo Usuario
    // const usuarioService = new UsuarioService();
    // const usuario = await usuarioService.findByEmail(email);
    
    const usuarioRepository = new UsuarioRepository(AppDataSource);
    const personaRepository = new PersonaRepository(AppDataSource);
    
    const usuarioService = new UsuarioService(usuarioRepository, personaRepository);
    const usuario = await usuarioService.getUsuarioByEmail(email);

    if (!usuario) {
       return NextResponse.json(
         { message: 'Usuario no encontrado' },
         { status: 404 }
       );
    }

    // Por ahora, simulamos que el usuario existe
    // Reemplaza esto con tu lógica real
    console.log(`Verificando usuario con email: ${email}`);
    
    return NextResponse.json(
      { message: 'Usuario encontrado', exists: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

*/