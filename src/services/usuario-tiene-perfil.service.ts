// usuario-tiene-perfil.service.ts
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsuarioTienePerfilRepository } from '../repositories/usuario-tiene-perfil.repository';
import { UsuarioService } from './usuario.service';
import { PerfilService } from './perfil.service';
import { CreateUsuarioTienePerfilDto, UsuarioTienePerfilResponseDto, UsuarioTienePerfilQueryDto } from '../dto/usuario-tiene-perfil.dto';

export class UsuarioTienePerfilService {
  constructor(
    private readonly usuarioTienePerfilRepository: UsuarioTienePerfilRepository,
    private readonly usuarioService: UsuarioService,
    private readonly perfilService: PerfilService,
  ) {}

  async asignarPerfilAUsuario(createDto: CreateUsuarioTienePerfilDto): Promise<UsuarioTienePerfilResponseDto> {
    // Validar que el usuario exista
    const usuario = await this.usuarioService.getUsuarioById(createDto.usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createDto.usuarioId} no encontrado`);
    }

    // Validar que el perfil exista
    const perfil = await this.perfilService.findById(createDto.perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${createDto.perfilId} no encontrado`);
    }

    // Verificar que la relación no exista ya
    const existeRelacion = await this.usuarioTienePerfilRepository.exists(
      createDto.usuarioId,
      createDto.perfilId
    );

    if (existeRelacion) {
      throw new ConflictException(
        `El usuario ${createDto.usuarioId} ya tiene asignado el perfil ${createDto.perfilId}`
      );
    }

    // Crear la relación
    const entity = await this.usuarioTienePerfilRepository.create({
      usuarioId: createDto.usuarioId,
      perfilId: createDto.perfilId,
    });

    // Buscar la entidad completa con relaciones para devolverla
    const usuarioTienePerfilCompleto = await this.usuarioTienePerfilRepository.findByUsuarioIdAndPerfilId(
      entity.usuarioId,
      entity.perfilId
    );

    if (!usuarioTienePerfilCompleto) {
      throw new NotFoundException('La relación usuario-perfil no se encontró después de ser creada');
    }

    return new UsuarioTienePerfilResponseDto({
      usuarioId: usuarioTienePerfilCompleto.usuarioId,
      perfilId: usuarioTienePerfilCompleto.perfilId,
      usuario: this.usuarioService.mapToResponseDto(usuarioTienePerfilCompleto.usuario),
      perfil: this.perfilService.mapToResponseDto(usuarioTienePerfilCompleto.perfil),
    });
  }

  async removerPerfilDelUsuario(usuarioId: string, perfilId: string): Promise<void> {
    if (!usuarioId || !perfilId) {
      throw new BadRequestException('El ID del usuario y el ID del perfil son requeridos');
    }

    const existeRelacion = await this.usuarioTienePerfilRepository.exists(usuarioId, perfilId);
    
    if (!existeRelacion) {
      throw new NotFoundException(
        `La relación entre el usuario ${usuarioId} y el perfil ${perfilId} no existe`
      );
    }

    const eliminado = await this.usuarioTienePerfilRepository.delete(usuarioId, perfilId);
    
    if (!eliminado) {
      throw new Error('Error al eliminar la relación usuario-perfil');
    }
  }

  async obtenerPerfilesDeUsuario(usuarioId: string): Promise<UsuarioTienePerfilResponseDto[]> {
    if (!usuarioId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    // Verificar que el usuario existe
    const usuario = await this.usuarioService.getUsuarioById(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const entities = await this.usuarioTienePerfilRepository.findByUsuarioId(usuarioId);
    
    return entities.map(entity => {
      return new UsuarioTienePerfilResponseDto({
        usuarioId: entity.usuarioId,
        perfilId: entity.perfilId,
        usuario: this.usuarioService.mapToResponseDto(entity.usuario),
        perfil: this.perfilService.mapToResponseDto(entity.perfil),
      });
    });
  }

  async obtenerUsuariosConPerfil(perfilId: string): Promise<UsuarioTienePerfilResponseDto[]> {
    if (!perfilId) {
      throw new BadRequestException('El ID del perfil es requerido');
    }

    // Verificar que el perfil existe
    const perfil = await this.perfilService.findById(perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    const entities = await this.usuarioTienePerfilRepository.findByPerfilId(perfilId);
    
    return entities.map(entity => {
      return new UsuarioTienePerfilResponseDto({
        usuarioId: entity.usuarioId,
        perfilId: entity.perfilId,
        usuario: this.usuarioService.mapToResponseDto(entity.usuario),
        perfil: this.perfilService.mapToResponseDto(entity.perfil),
      });
    });
  }

  async obtenerTodasLasRelaciones(query?: UsuarioTienePerfilQueryDto): Promise<UsuarioTienePerfilResponseDto[]> {
    let entities;

    if (query?.usuarioId && query?.perfilId) {
      const entity = await this.usuarioTienePerfilRepository.findByUsuarioIdAndPerfilId(
        query.usuarioId,
        query.perfilId
      );
      entities = entity ? [entity] : [];
    } else if (query?.usuarioId) {
      entities = await this.usuarioTienePerfilRepository.findByUsuarioId(query.usuarioId);
    } else if (query?.perfilId) {
      entities = await this.usuarioTienePerfilRepository.findByPerfilId(query.perfilId);
    } else {
      entities = await this.usuarioTienePerfilRepository.findAll();
    }

    return entities.map(entity => {
      return new UsuarioTienePerfilResponseDto({
        usuarioId: entity.usuarioId,
        perfilId: entity.perfilId,
        usuario: this.usuarioService.mapToResponseDto(entity.usuario),
        perfil: this.perfilService.mapToResponseDto(entity.perfil),
      });
    });
  }

  async verificarPerfilEnUsuario(usuarioId: string, perfilId: string): Promise<boolean> {
    if (!usuarioId || !perfilId) {
      throw new BadRequestException('El ID del usuario y el ID del perfil son requeridos');
    }

    return await this.usuarioTienePerfilRepository.exists(usuarioId, perfilId);
  }

  async contarPerfilesPorUsuario(usuarioId: string): Promise<number> {
    if (!usuarioId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    return await this.usuarioTienePerfilRepository.countByUsuarioId(usuarioId);
  }

  async contarUsuariosPorPerfil(perfilId: string): Promise<number> {
    if (!perfilId) {
      throw new BadRequestException('El ID del perfil es requerido');
    }

    return await this.usuarioTienePerfilRepository.countByPerfilId(perfilId);
  }

  async removerTodosLosPerfilesDelUsuario(usuarioId: string): Promise<number> {
    if (!usuarioId) {
      throw new BadRequestException('El ID del usuario es requerido');
    }

    // Verificar que el usuario existe
    const usuario = await this.usuarioService.getUsuarioById(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    return await this.usuarioTienePerfilRepository.deleteByUsuarioId(usuarioId);
  }

  async removerPerfilDeTodosLosUsuarios(perfilId: string): Promise<number> {
    if (!perfilId) {
      throw new BadRequestException('El ID del perfil es requerido');
    }

    // Verificar que el perfil existe
    const perfil = await this.perfilService.findById(perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    return await this.usuarioTienePerfilRepository.deleteByPerfilId(perfilId);
  }
}