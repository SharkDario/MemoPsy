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
import { UsuarioEntity } from '@/entities/usuario.entity';
import { PersonaEntity } from '@/entities/persona.entity';
import { PsicologoEntity } from '@/entities/psicologo.entity';
import { PacienteEntity } from '@/entities/paciente.entity';
import { ObraSocialEntity } from '@/entities/obra-social.entity';
import { PerfilEntity } from '@/entities/perfil.entity'; // Added
import { UsuarioTienePerfilEntity } from '@/entities/usuario-tiene-perfil.entity'; // Added

// Placeholder for DTOs if not formally defined in dto files for this step
interface PersonaPatchDto {
  nombre?: string;
  apellido?: string;
  dni?: string;
  fecha_nacimiento?: string;
}
interface PsicologoPatchDto {
  especialidad?: string;
  numeroLicencia?: string;
}
interface PacientePatchDto {
  idObraSocial?: string | null; // string from form, might need parsing to number
}
interface PatchUsuarioPayloadDto {
  email?: string; // Assuming email might not be editable this way or handled carefully
  activo?: boolean;
  persona?: PersonaPatchDto;
  psicologo?: PsicologoPatchDto | null; // Can be null to remove psicologo role
  paciente?: PacientePatchDto | null;   // Can be null to remove paciente role
}

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
        permiso => permiso.modulo.nombre === 'Usuarios' && permiso.accion.nombre === 'Registrar'
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

   // PATCH /api/usuarios/[id] - Actualizar parcialmente usuario
  static async patchUsuario(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      const { id } = params;
      const hasPermission = session.user.permisos.some(
        (p: any) => p.modulo.nombre === 'Usuarios' && p.accion.nombre === 'Editar'
      );
      const isOwnProfile = session.user.id === id;

      if (!isOwnProfile && !hasPermission) {
        return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
      }
      
      const body: PatchUsuarioPayloadDto = await request.json();

      // Basic validation for payload
      if (typeof body !== 'object' || body === null) {
        return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 });
      }
      if (body.persona && typeof body.persona !== 'object') {
         return NextResponse.json({ error: 'Datos de persona inválidos' }, { status: 400 });
      }
      if (body.psicologo !== undefined && typeof body.psicologo !== 'object') { // null is an object, so explicitly check undefined
         return NextResponse.json({ error: 'Datos de psicólogo inválidos' }, { status: 400 });
      }
       if (body.paciente !== undefined && typeof body.paciente !== 'object') {
         return NextResponse.json({ error: 'Datos de paciente inválidos' }, { status: 400 });
      }


      const updatedUsuario = await AppDataSource.transaction(async transactionalEntityManager => {
        const usuarioRepo = transactionalEntityManager.getRepository(UsuarioEntity);
        const personaRepo = transactionalEntityManager.getRepository(PersonaEntity);
        const psicologoRepo = transactionalEntityManager.getRepository(PsicologoEntity);
        const pacienteRepo = transactionalEntityManager.getRepository(PacienteEntity);
        const obraSocialRepo = transactionalEntityManager.getRepository(ObraSocialEntity);

        const usuario = await usuarioRepo.findOne({ where: { id_usuario: id }, relations: ['persona', 'persona.psicologo', 'persona.paciente'] });

        if (!usuario) {
          throw new Error('Usuario no encontrado'); // This will be caught and returned as 404
        }
        if (!usuario.persona) {
            throw new Error('Datos personales del usuario no encontrados'); // Should not happen
        }

        // 1. Update UsuarioEntity
        if (body.activo !== undefined && (hasPermission || !isOwnProfile)) { // Only allow status change if has full permission or not editing self
             if (isOwnProfile && !hasPermission && usuario.activo !== body.activo) {
                 // User trying to change their own status without full edit permission
                 // This case might be blocked or handled based on stricter rules
                 // For now, let's assume if 'activo' is in payload for self-edit without full perm, it's ignored or only allowed if not changing.
                 // The UI logic already prevents non-admin from changing their own 'activo' if that's a rule.
                 // Here, we ensure backend respects it if 'activo' is part of payload.
             } else {
                usuario.activo = body.activo;
             }
        }
        // Email update: typically needs careful consideration (e.g., verification)
        // For now, only update if provided and different.
        if (body.email && body.email !== usuario.email && hasPermission) { // Only admin can change email
             // Add validation for email format if not done by DTO
            usuario.email = body.email;
        }


        // 2. Update PersonaEntity
        if (body.persona) {
          const personaData = body.persona;
          if (personaData.nombre) usuario.persona.nombre = personaData.nombre;
          if (personaData.apellido) usuario.persona.apellido = personaData.apellido;
          if (personaData.dni) usuario.persona.dni = personaData.dni;
          if (personaData.fecha_nacimiento) usuario.persona.fecha_nacimiento = new Date(personaData.fecha_nacimiento);
          await personaRepo.save(usuario.persona);
        }
        
        // 3. Handle Psicologo
        if (body.psicologo !== undefined) { // Check if 'psicologo' key is in payload
          if (body.psicologo === null) { // Request to remove psicologo role
            if (usuario.persona.psicologo) {
              await psicologoRepo.remove(usuario.persona.psicologo);
              usuario.persona.psicologo = null;
              usuario.id_psicologo = null; // Clear direct foreign key on Usuario if it exists
            }
          } else { // Request to add/update psicologo role
            let psicologo = usuario.persona.psicologo;
            if (!psicologo) {
              psicologo = new PsicologoEntity();
              psicologo.persona = usuario.persona; // Link to persona
              // psicologo.id_psicologo = usuario.persona.id_persona; // If ID is shared, or handle UUID generation
            }
            if(body.psicologo.especialidad) psicologo.especialidad = body.psicologo.especialidad;
            if(body.psicologo.numeroLicencia) psicologo.numero_licencia = body.psicologo.numeroLicencia; // Ensure entity field name match
            
            await psicologoRepo.save(psicologo);
            usuario.persona.psicologo = psicologo;
            usuario.id_psicologo = psicologo.id_psicologo; // Set direct foreign key
          }
        }

        // 4. Handle Paciente
        if (body.paciente !== undefined) { // Check if 'paciente' key is in payload
          if (body.paciente === null) { // Request to remove paciente role
            if (usuario.persona.paciente) {
              await pacienteRepo.remove(usuario.persona.paciente);
              usuario.persona.paciente = null;
              usuario.id_paciente = null; // Clear direct foreign key on Usuario
            }
          } else { // Request to add/update paciente role
            let paciente = usuario.persona.paciente;
            if (!paciente) {
              paciente = new PacienteEntity();
              paciente.persona = usuario.persona; // Link to persona
              // paciente.id_paciente = usuario.persona.id_persona; // If ID is shared
            }
            if (body.paciente.idObraSocial !== undefined) { // idObraSocial can be null
                if(body.paciente.idObraSocial === null) {
                    paciente.obraSocial = null; // Disassociate
                } else {
                    const obraSocial = await obraSocialRepo.findOneBy({ id_obra_social: body.paciente.idObraSocial });
                    if (!obraSocial) {
                        throw new Error('Obra Social no encontrada'); // Will be caught as 400
                    }
                    paciente.obraSocial = obraSocial;
                }
            }
            await pacienteRepo.save(paciente);
            usuario.persona.paciente = paciente;
            usuario.id_paciente = paciente.id_paciente; // Set direct foreign key
          }
        }
        
        // Save Usuario changes (like activo, or FKs if any changed: id_psicologo, id_paciente)
        await usuarioRepo.save(usuario);
        
        // Refetch the user with all relations to return the updated state
        // This is important because the 'usuario' object might have stale relations after individual saves
        return await usuarioRepo.findOne({ 
            where: { id_usuario: id }, 
            relations: ['persona', 'persona.psicologo', 'persona.paciente', 'persona.paciente.obraSocial', 'perfiles'] 
        });
      });
      
      if (!updatedUsuario) { // Should be caught by error in transaction if not found earlier
        return NextResponse.json({ error: 'Usuario no encontrado tras la actualización' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: updatedUsuario });

    } catch (error: any) {
      console.error('Error al actualizar parcialmente usuario:', error);
      let statusCode = 500;
      if (error.message === 'Usuario no encontrado' || error.message === 'Datos personales del usuario no encontrados') {
        statusCode = 404;
      } else if (error.message === 'Obra Social no encontrada') {
        statusCode = 400; // Bad request due to invalid ID
      }
      return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }

  // GET /api/usuarios/[id]/perfiles - Obtener perfiles de un usuario
  static async getUserProfiles(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      // Permission check: user can view their own profiles or needs 'Ver Usuario' or 'Asignar Perfil'
      const { id: userId } = params;
      const isOwnProfile = session.user.id === userId;
      const hasGeneralViewPermission = session.user.permisos.some(
        (p: any) => p.modulo.nombre === 'Usuarios' && p.accion.nombre === 'Ver'
      );
      const hasAssignPermission = session.user.permisos.some(
        (p: any) => p.modulo.nombre === 'Perfiles' && p.accion.nombre === 'Asignar' // Assuming 'Asignar Perfil' might be under 'Perfiles' module
      );

      if (!isOwnProfile && !hasGeneralViewPermission && !hasAssignPermission) {
        return NextResponse.json({ error: 'No tienes permisos para ver perfiles de este usuario' }, { status: 403 });
      }
      
      const usuarioRepo = AppDataSource.getRepository(UsuarioEntity);
      const usuario = await usuarioRepo.findOne({
        where: { id_usuario: userId },
        relations: ['perfiles', 'perfiles.perfil'], // Load perfiles through UsuarioTienePerfilEntity to PerfilEntity
      });

      if (!usuario) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      
      // The 'perfiles' relation on UsuarioEntity should be an array of UsuarioTienePerfilEntity
      // We want to return an array of PerfilEntity objects or a simplified version.
      const assignedProfiles = usuario.perfiles?.map(utp => utp.perfil) || [];

      return NextResponse.json({ success: true, data: assignedProfiles });

    } catch (error: any) {
      console.error('Error al obtener perfiles del usuario:', error);
      return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
  }

  // PUT /api/usuarios/[id]/perfiles - Actualizar perfiles de un usuario
  static async updateUserProfiles(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const session = await getServerSession(authConfig);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      const { id: userId } = params;

      // Permission check: needs 'Asignar Perfil' or a general 'Editar Usuario'
      // For now, let's assume 'Editar Usuario' covers this.
      // A more granular 'Asignar Perfil' permission would be better.
      const hasEditPermission = session.user.permisos.some(
        (p: any) => p.modulo.nombre === 'Usuarios' && p.accion.nombre === 'Editar'
      );
       const hasAssignPermission = session.user.permisos.some(
        (p: any) => p.modulo.nombre === 'Perfiles' && p.accion.nombre === 'Asignar'
      );


      if (!hasEditPermission && !hasAssignPermission) {
        return NextResponse.json({ error: 'No tienes permisos para asignar perfiles' }, { status: 403 });
      }

      const profileIdsToAssign: string[] = await request.json();

      if (!Array.isArray(profileIdsToAssign) || !profileIdsToAssign.every(id => typeof id === 'string')) {
        return NextResponse.json({ error: 'Cuerpo de la solicitud inválido, se espera un array de IDs de perfil (string[])' }, { status: 400 });
      }

      await AppDataSource.transaction(async transactionalEntityManager => {
        const usuarioRepo = transactionalEntityManager.getRepository(UsuarioEntity);
        const perfilRepo = transactionalEntityManager.getRepository(PerfilEntity);
        const usuarioTienePerfilRepo = transactionalEntityManager.getRepository(UsuarioTienePerfilEntity);

        const usuario = await usuarioRepo.findOneBy({ id_usuario: userId });
        if (!usuario) {
          throw new Error('Usuario no encontrado'); // Caught by try-catch, returns 404
        }

        // 1. Remove existing profile assignments for this user
        await usuarioTienePerfilRepo.delete({ usuario: { id_usuario: userId } });
        
        // 2. Validate and add new profile assignments
        if (profileIdsToAssign.length > 0) {
          const newAssignments: UsuarioTienePerfilEntity[] = [];
          for (const perfilId of profileIdsToAssign) {
            const perfil = await perfilRepo.findOneBy({ id_perfil: perfilId });
            if (!perfil) {
              throw new Error(`Perfil con ID ${perfilId} no encontrado.`); // Caught, returns 400
            }
            const newAssignment = usuarioTienePerfilRepo.create({
              usuario: usuario,
              perfil: perfil,
            });
            newAssignments.push(newAssignment);
          }
          await usuarioTienePerfilRepo.save(newAssignments);
        }
      });

      return NextResponse.json({ success: true, message: 'Perfiles actualizados correctamente' });

    } catch (error: any) {
      console.error('Error al actualizar perfiles del usuario:', error);
      let statusCode = 500;
      if (error.message === 'Usuario no encontrado') {
        statusCode = 404;
      } else if (error.message.startsWith('Perfil con ID')) {
        statusCode = 400; // Invalid profile ID provided
      }
      return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: statusCode });
    }
  }
}