// /app/api/profile/perfiles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Perfil } from '@/entities';

export async function GET() {
  try {
    // Comprobar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const perfilRepository = AppDataSource.getRepository(Perfil);
    
    const perfiles = await perfilRepository.find({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
      order: {
        nombre: 'ASC',
      },
    });
    
    return NextResponse.json(perfiles);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    return NextResponse.json(
      { error: 'Error al obtener los perfiles' }, 
      { status: 500 }
    );
  }
}