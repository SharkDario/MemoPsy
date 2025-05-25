// lib/controllers/usuario.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { UsuarioService } from '@/services/usuario.service';
import { UsuarioRepository, PersonaRepository } from '@/repositories/index';
import { 
  CreateUsuarioDto, 
  UpdateUsuarioDto, 
  ChangePasswordDto,
  UsuarioFiltersDto 
} from '@/dto/usuario.dto';
import { AppDataSource } from '@/lib/database';

// Inicializar servicios (esto debería venir de tu contenedor de dependencias)
const usuarioRepository = new UsuarioRepository(AppDataSource);
const personaRepository = new PersonaRepository(AppDataSource);
const usuarioService = new UsuarioService(usuarioRepository, personaRepository);

export class UsuarioController {
  
  // GET /api/usuarios - Obtener todos los usuarios
  static async getAllUsuarios(request: NextRequest) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      // Verificar permisos (usuario debe tener permiso para ver usuarios)
      const hasPermission = session.user.permisos.some(
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Ver'
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const filters: UsuarioFiltersDto = {};

      if (searchParams.get('activo')) {
        filters.activo = searchParams.get('activo') === 'true';
      }

      if (searchParams.get('email')) {
        filters.email = searchParams.get('email')!;
      }

      const usuarios = await usuarioService.getAllUsuarios(filters);

      return NextResponse.json({
        success: true,
        data: usuarios
      });

    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 500 }
      );
    }
  }

  // POST /api/usuarios - Crear usuario
  static async createUsuario(request: NextRequest) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      // Verificar permisos
      const hasPermission = session.user.permisos.some(
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Crear'
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const createUsuarioDto: CreateUsuarioDto = body;

      const usuario = await usuarioService.createUsuario(createUsuarioDto);

      return NextResponse.json({
        success: true,
        data: usuario
      }, { status: 201 });

    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 400 }
      );
    }
  }

  // GET /api/usuarios/[id] - Obtener usuario por ID
  static async getUsuarioById(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      const { id } = params;

      // Los usuarios pueden ver su propio perfil o tener permiso para ver usuarios
      const canViewOwnProfile = session.user.id === id;
      const hasPermission = session.user.permisos.some(
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Ver'
      );

      if (!canViewOwnProfile && !hasPermission) {
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 }
        );
      }

      const usuario = await usuarioService.getUsuarioById(id);

      if (!usuario) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Usuario no encontrado' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: usuario
      });

    } catch (error: any) {
      console.error('Error al obtener usuario:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 500 }
      );
    }
  }

  // PUT /api/usuarios/[id] - Actualizar usuario
  static async updateUsuario(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      const { id } = params;

      // Los usuarios pueden actualizar su propio perfil o tener permiso para editar usuarios
      const canEditOwnProfile = session.user.id === id;
      const hasPermission = session.user.permisos.some(
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Editar'
      );

      if (!canEditOwnProfile && !hasPermission) {
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const updateUsuarioDto: UpdateUsuarioDto = body;

      // Si es el propio usuario, no puede cambiar el estado activo
      if (canEditOwnProfile && !hasPermission && updateUsuarioDto.activo !== undefined) {
        delete updateUsuarioDto.activo;
      }

      const usuario = await usuarioService.updateUsuario(id, updateUsuarioDto);

      if (!usuario) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Usuario no encontrado' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: usuario
      });

    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 400 }
      );
    }
  }

  // DELETE /api/usuarios/[id] - Eliminar usuario
  static async deleteUsuario(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      // Verificar permisos
      const hasPermission = session.user.permisos.some(
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Eliminar'
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 }
        );
      }

      const { id } = params;

      // No permitir que un usuario se elimine a sí mismo
      if (session.user.id === id) {
        return NextResponse.json(
          { error: 'No puedes eliminar tu propia cuenta' },
          { status: 400 }
        );
      }

      const deleted = await usuarioService.deleteUsuario(id);

      if (!deleted) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Usuario no encontrado' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });

    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 500 }
      );
    }
  }

  // PATCH /api/usuarios/[id]/toggle-status - Activar/Desactivar usuario
  static async toggleUsuarioStatus(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      // Verificar permisos
      const hasPermission = session.user.permisos.some(
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Editar'
      );

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción' },
          { status: 403 }
        );
      }

      const { id } = params;

      // No permitir que un usuario se desactive a sí mismo
      if (session.user.id === id) {
        return NextResponse.json(
          { error: 'No puedes cambiar el estado de tu propia cuenta' },
          { status: 400 }
        );
      }

      const usuario = await usuarioService.toggleUsuarioStatus(id);

      if (!usuario) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Usuario no encontrado' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: usuario,
        message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`
      });

    } catch (error: any) {
      console.error('Error al cambiar estado del usuario:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 500 }
      );
    }
  }

  // POST /api/usuarios/[id]/change-password - Cambiar contraseña
  static async changePassword(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      const { id } = params;

      // Solo el propio usuario puede cambiar su contraseña
      if (session.user.id !== id) {
        return NextResponse.json(
          { error: 'Solo puedes cambiar tu propia contraseña' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const changePasswordDto: ChangePasswordDto = body;

      await usuarioService.changePassword(id, changePasswordDto);

      return NextResponse.json({
        success: true,
        message: 'Contraseña cambiada correctamente'
      });

    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 400 }
      );
    }
  }

  // GET /api/usuarios/me - Obtener datos del usuario actual
  static async getCurrentUser(request: NextRequest) {
    try {
      const session = await getServerSession(authConfig);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: session.user
      });

    } catch (error: any) {
      console.error('Error al obtener usuario actual:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error interno del servidor' 
        },
        { status: 500 }
      );
    }
  }
}