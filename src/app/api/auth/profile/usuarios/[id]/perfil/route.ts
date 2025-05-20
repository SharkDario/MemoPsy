// /app/api/profile/usuarios/[id]/perfil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Usuario, Perfil } from '@/entities';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuarioId = params.id;
    const { perfilId } = await request.json();

    // Convertir "none" en null para eliminar el perfil
    const perfilIdFinal = perfilId === "none" ? null : perfilId;

    // Comprobar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    
    // Verificar si el usuario existe
    const usuario = await usuarioRepository.findOne({
      where: { id: usuarioId },
    });
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' }, 
        { status: 404 }
      );
    }
    
    // Si perfilId es null, quitar el perfil
    if (perfilIdFinal === null) {
      usuario.perfilId = null;
      await usuarioRepository.save(usuario);
      
      return NextResponse.json({ success: true });
    }
    
    // Verificar si el perfil existe
    const perfilRepository = AppDataSource.getRepository(Perfil);
    const perfil = await perfilRepository.findOne({
      where: { id: perfilId },
    });
    
    if (!perfil) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' }, 
        { status: 404 }
      );
    }
    
    // Actualizar el perfil del usuario
    usuario.perfilId = perfilId;
    await usuarioRepository.save(usuario);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);

    return NextResponse.json(
      { error: 'Error al actualizar el perfil' }, 
      { status: 500 }
    );
  }
}