import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Perfil, Permiso, PerfilPermiso } from '@/entities';

// GET /api/auth/profile/crear - Obtener todos los perfiles
export async function GET() {
  try {
    // Asegurar que la conexión a la base de datos está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const perfilRepository = AppDataSource.getRepository(Perfil);
    
    const perfiles = await perfilRepository.find({
      relations: ["permisos"]
    });
    
    //await AppDataSource.destroy();
    return NextResponse.json(perfiles);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    return NextResponse.json(
      { message: 'Error al obtener perfiles' },
      { status: 500 }
    );
  }
}

// POST /api/auth/profile/crear - Crear un nuevo perfil
export async function POST(request: NextRequest) {
  try {
    const { nombre, descripcion, permisoIds } = await request.json();
    
    // Validaciones
    if (!nombre || !permisoIds || !Array.isArray(permisoIds) || permisoIds.length === 0) {
      return NextResponse.json(
        { message: 'Nombre y permisos son requeridos' },
        { status: 400 }
      );
    }
    
    // Asegurar que la conexión a la base de datos está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Verificar si ya existe un perfil con el mismo nombre
    const perfilRepository = AppDataSource.getRepository(Perfil);
    const permisoRepository = AppDataSource.getRepository(Permiso);
    
    const perfilExistente = await perfilRepository.findOne({ where: { nombre } });
    if (perfilExistente) {
      //await AppDataSource.destroy();
      return NextResponse.json(
        { message: 'Ya existe un perfil con ese nombre' },
        { status: 400 }
      );
    }
    
    // Obtener los permisos seleccionados
    const permisos = await permisoRepository.findByIds(permisoIds);
    
    if (permisos.length === 0) {
      //await AppDataSource.destroy();
      return NextResponse.json(
        { message: 'No se encontraron permisos válidos' },
        { status: 400 }
      );
    }
    
    // Crear el nuevo perfil
    const nuevoPerfil = new Perfil();
    nuevoPerfil.nombre = nombre;
    nuevoPerfil.descripcion = descripcion || null;
    nuevoPerfil.permisos = permisos;
    
    // Guardar el perfil
    const perfilGuardado = await perfilRepository.save(nuevoPerfil);
    
    //await AppDataSource.destroy();
    
    return NextResponse.json(perfilGuardado, { status: 201 });
  } catch (error) {
    console.error('Error al crear perfil:', error);
    return NextResponse.json(
      { message: 'Error al crear el perfil' },
      { status: 500 }
    );
  }
}