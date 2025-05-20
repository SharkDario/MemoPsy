// /app/api/profile/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Usuario, Persona, Perfil } from '@/entities';

export async function GET(request: NextRequest) {
  try {
    // Asegurar que la conexión a la base de datos está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);

    // Obtener todos los usuarios con relaciones directamente
    const usuarios = await usuarioRepository.find({
      relations: ['persona', 'perfil'],
    });

    // Formatear la respuesta con seguridad
    const usuariosFormateados = usuarios.map((usuario) => ({
      id: usuario.id,
      email: usuario.email,
      activo: usuario.activo,
      esAdmin: usuario.esAdmin,
      persona: usuario.persona
        ? {
            nombre: usuario.persona.nombre,
            apellido: usuario.persona.apellido,
            dni: usuario.persona.dni,
          }
        : null,
      perfil: usuario.perfil
        ? {
            id: usuario.perfil.id,
            nombre: usuario.perfil.nombre,
          }
        : null,
    }));

    return NextResponse.json(usuariosFormateados);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: `Error al obtener los usuarios: ${error.message}` },
      { status: 500 }
    );
  }
}

/*
// 2
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Usuario } from '@/entities';

export async function GET(request: NextRequest) {
  try {
    // Comprobar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    
    // Usar una consulta más básica sin relaciones complejas
    const usuarios = await usuarioRepository.find();
    
    // Luego, manualmente poblar la información que necesitas
    const usuariosFormateados = await Promise.all(usuarios.map(async (usuario) => {
      // Obtener la persona relacionada si existe
      let personaInfo = null;
      if (usuario.personaId) {
        try {
          const personaRepo = AppDataSource.getRepository('Persona');
          const persona = await personaRepo.findOne({ 
            where: { id: usuario.personaId } 
          });
          if (persona) {
            personaInfo = {
              nombre: persona.nombre,
              apellido: persona.apellido,
              dni: persona.dni
            };
          }
        } catch (error) {
          console.error(`Error al obtener persona para usuario ${usuario.id}:`, error);
        }
      }
      
      // Obtener el perfil relacionado si existe
      let perfilInfo = null;
      if (usuario.perfilId) {
        try {
          const perfilRepo = AppDataSource.getRepository('Perfil');
          const perfil = await perfilRepo.findOne({ 
            where: { id: usuario.perfilId } 
          });
          if (perfil) {
            perfilInfo = {
              id: perfil.id,
              nombre: perfil.nombre
            };
          }
        } catch (error) {
          console.error(`Error al obtener perfil para usuario ${usuario.id}:`, error);
        }
      }
      
      // Construir objeto de respuesta
      return {
        id: usuario.id,
        email: usuario.email,
        activo: usuario.activo,
        esAdmin: usuario.esAdmin,
        persona: personaInfo,
        perfil: perfilInfo
      };
    }));
    
    return NextResponse.json(usuariosFormateados);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: `Error al obtener los usuarios: ${error.message}` }, 
      { status: 500 }
    );
  }
}
// 1
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Usuario, Perfil } from '@/entities';

// Endpoint para obtener todos los usuarios con sus perfiles
export async function GET(request: NextRequest) {
  try {
    // Comprobar si la conexión ya está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    
    const usuarios = await usuarioRepository.find({
      relations: ['persona', 'perfil'],
      select: {
        id: true,
        email: true,
        activo: true,
        esAdmin: true,
        persona: {
          nombre: true,
          apellido: true,
          dni: true,
        },
        perfil: {
          id: true,
          nombre: true,
        }
      }
    });
    
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);

    return NextResponse.json(
      { error: 'Error al obtener los usuarios' }, 
      { status: 500 }
    );
  }
}
*/