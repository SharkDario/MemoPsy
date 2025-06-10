// app/api/auth/check-user/route.ts
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

