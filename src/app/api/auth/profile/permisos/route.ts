import { NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Permiso } from '@/entities';

// GET /api/auth/profile/permisos - Obtener todos los permisos
export async function GET() {
  let isConnected = false;
  
  try {
    // Verificar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      isConnected = true;
    }
    
    const permisoRepository = AppDataSource.getRepository(Permiso);
    
    const permisos = await permisoRepository.find({
      order: {
        modulo: "ASC",
        accion: "ASC"
      }
    });
    
    // Solo destruir la conexión si nosotros la inicializamos
    if (isConnected) {
      await AppDataSource.destroy();
    }
    
    return NextResponse.json(permisos);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    
    // Asegurarse de cerrar la conexión en caso de error si la abrimos
    if (isConnected && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    return NextResponse.json(
      { message: 'Error al obtener permisos' },
      { status: 500 }
    );
  }
}