// src/lib/controllers/estado.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { EstadoService } from '@/services/estado.service';
import { EstadoRepository } from '@/repositories/estado.repository';
import { AppDataSource } from '@/lib/database';
import { EstadoEntity } from '@/entities/estado.entity';
import { CreateEstadoDto, UpdateEstadoDto } from '@/dto/estado.dto';

// Initialize repository and service
// EstadoRepository constructor expects Repository<EstadoEntity>
const typeOrmEstadoRepository = AppDataSource.getRepository(EstadoEntity);
const estadoRepository = new EstadoRepository(typeOrmEstadoRepository);
const estadoService = new EstadoService(estadoRepository);

export class EstadoController {

  // GET /api/estados - Obtener todos los estados
  static async getAllEstados(request: NextRequest) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const hasPermission = session.user.permisos?.some(
        (permiso: any) => permiso.modulo.nombre === 'Estados' && permiso.accion.nombre === 'Ver'
      );
      if (!hasPermission) {
        return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
      }

      // EstadoService.getAllEstados() does not currently accept filters.
      // const { searchParams } = new URL(request.url);
      // const filters: any = {}; 
      // if (searchParams.get('nombre')) {
      //   filters.nombre = searchParams.get('nombre')!;
      // }
      
      const estados = await estadoService.getAllEstados();
      return NextResponse.json({ success: true, data: estados });
    } catch (error: any) {
      console.error('Error al obtener estados:', error);
      // Service throws generic Error, so we check message content for status
      let statusCode = 500;
      if (error.message?.includes('No autorizado')) statusCode = 401;
      else if (error.message?.includes('No tienes permisos')) statusCode = 403;
      return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }

  // POST /api/estados - Crear estado
  static async createEstado(request: NextRequest) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const hasPermission = session.user.permisos?.some(
        (permiso: any) => permiso.modulo.nombre === 'Estados' && permiso.accion.nombre === 'Crear'
      );
      if (!hasPermission) {
        return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
      }

      const body = await request.json();
      const createEstadoDto: CreateEstadoDto = body; 
      const nuevoEstado = await estadoService.createEstado(createEstadoDto);
      return NextResponse.json({ success: true, data: nuevoEstado }, { status: 201 });
    } catch (error: any) {
      console.error('Error al crear estado:', error);
      let statusCode = 400; // Default to Bad Request
      if (error.message?.includes('No autorizado')) statusCode = 401;
      else if (error.message?.includes('No tienes permisos')) statusCode = 403;
      else if (error.message?.includes('Ya existe un estado con este nombre')) statusCode = 409; // Conflict
      else if (error.message?.toLowerCase().includes('errores de validación')) statusCode = 400; // Validation from DTO
      else if (error.message?.toLowerCase().includes('el nombre es requerido')) statusCode = 400;

      return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }

  // GET /api/estados/[id] - Obtener estado por ID
  static async getEstadoById(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const hasPermission = session.user.permisos?.some(
        (permiso: any) => permiso.modulo.nombre === 'Estados' && permiso.accion.nombre === 'Ver'
      );
      if (!hasPermission) {
         return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
      }

      const { id } = params;
      const estado = await estadoService.getEstadoById(id);
      // Service method throws error if not found, so an explicit check here might be redundant
      // if (!estado) { 
      //   return NextResponse.json({ success: false, error: 'Estado no encontrado' }, { status: 404 });
      // }
      return NextResponse.json({ success: true, data: estado });
    } catch (error: any) {
      console.error('Error al obtener estado:', error);
      let statusCode = 500;
      if (error.message?.includes('No autorizado')) statusCode = 401;
      else if (error.message?.includes('No tienes permisos')) statusCode = 403;
      else if (error.message?.includes('Estado no encontrado')) statusCode = 404;
      else if (error.message?.includes('El ID es requerido')) statusCode = 400;
      return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }

  // PUT /api/estados/[id] - Actualizar estado
  static async updateEstado(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const hasPermission = session.user.permisos?.some(
        (permiso: any) => permiso.modulo.nombre === 'Estados' && permiso.accion.nombre === 'Editar'
      );
      if (!hasPermission) {
        return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
      }

      const { id } = params;
      const body = await request.json();
      const updateEstadoDto: UpdateEstadoDto = body;
      const estadoActualizado = await estadoService.updateEstado(id, updateEstadoDto);
      // Service method throws error if not found
      // if (!estadoActualizado) {
      //   return NextResponse.json({ success: false, error: 'Estado no encontrado para actualizar' }, { status: 404 });
      // }
      return NextResponse.json({ success: true, data: estadoActualizado });
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      let statusCode = 400; // Default to Bad Request
      if (error.message?.includes('No autorizado')) statusCode = 401;
      else if (error.message?.includes('No tienes permisos')) statusCode = 403;
      else if (error.message?.includes('Estado no encontrado')) statusCode = 404;
      else if (error.message?.includes('Ya existe un estado con este nombre')) statusCode = 409; // Conflict
      else if (error.message?.toLowerCase().includes('errores de validación')) statusCode = 400;
      else if (error.message?.includes('El ID es requerido')) statusCode = 400;
      return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }

  // DELETE /api/estados/[id] - Eliminar estado
  static async deleteEstado(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      const hasPermission = session.user.permisos?.some(
        (permiso: any) => permiso.modulo.nombre === 'Estados' && permiso.accion.nombre === 'Eliminar'
      );
      if (!hasPermission) {
        return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
      }

      const { id } = params;
      await estadoService.deleteEstado(id); 
      return NextResponse.json({ success: true, message: 'Estado eliminado correctamente' });
    } catch (error: any) {
      console.error('Error al eliminar estado:', error);
      let statusCode = 500;
      if (error.message?.includes('No autorizado')) statusCode = 401;
      else if (error.message?.includes('No tienes permisos')) statusCode = 403;
      else if (error.message?.includes('Estado no encontrado')) statusCode = 404;
      else if (error.message?.includes('El ID es requerido')) statusCode = 400;
      return NextResponse.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }
}