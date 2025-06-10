// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services';
import { UsuarioRepository, PersonaRepository } from '@/repositories';
import { AppDataSource } from '@/lib/database';
import { ChangePasswordDto } from '@/dto/usuario.dto';
import * as bcrypt from "bcrypt";
import App from 'next/app';
// Importa tu servicio/repositorio de Usuario aquí
// import { UsuarioService } from '@/services/UsuarioService';

export async function POST(request: NextRequest) {
  try {
    // Comprobar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const { email, newPassword, timestamp, expires } = await request.json();

    // Validar que todos los campos estén presentes
    if (!email || !newPassword || !timestamp || !expires) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el enlace no haya expirado
    const currentTime = Date.now();
    const expirationTime = parseInt(expires);
    
    if (currentTime > expirationTime) {
      return NextResponse.json(
        { message: 'El enlace de recuperación ha expirado' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Aquí deberías:
    // 1. Buscar el usuario por email
    // 2. Hashear la nueva contraseña
    // 3. Actualizar la contraseña en la base de datos
    // 4. Actualizar el ultimoAcceso si es necesario
    const usuarioRepository = new UsuarioRepository(AppDataSource);
    const personaRepository = new PersonaRepository(AppDataSource);

    const usuarioService = new UsuarioService(usuarioRepository, personaRepository);
    
    // Buscar usuario
    const usuario = await usuarioService.getUsuarioByEmail(email);
    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.newPassword = hashedPassword;
    //usuario.password = hashedPassword;
    //usuario.ultimoAcceso = new Date();
    
    await usuarioService.changePassword(usuario.id, changePasswordDto);
    

    // actualización exitosa
    console.log(`Actualizando contraseña para usuario: ${email}`);
    console.log(`Timestamp: ${timestamp}, Expires: ${expires}`);
    
    // Simular delay de base de datos
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(
      { 
        message: 'Contraseña actualizada exitosamente',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}