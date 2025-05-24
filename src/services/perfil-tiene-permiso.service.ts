// perfil-tiene-permiso.service.ts
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PerfilTienePermisoRepository } from '../repositories/perfil-tiene-permiso.repository';
import { PerfilService } from './perfil.service';
import { PermisoService } from './permiso.service';
import { CreatePerfilTienePermisoDto, PerfilTienePermisoResponseDto, PerfilTienePermisoQueryDto } from '../dto/perfil-tiene-permiso.dto';
import { PerfilTienePermiso } from '../models/perfil-tiene-permiso.model';

export class PerfilTienePermisoService {
  constructor(
    private readonly perfilTienePermisoRepository: PerfilTienePermisoRepository,
    private readonly perfilService: PerfilService,
    private readonly permisoService: PermisoService,
  ) {}

  async asignarPermisoAPerfil(createDto: CreatePerfilTienePermisoDto): Promise<PerfilTienePermisoResponseDto> {
    // Validar que el perfil exista
    const perfil = await this.perfilService.findById(createDto.perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${createDto.perfilId} no encontrado`);
    }

    // Validar que el permiso exista
    const permiso = await this.permisoService.findById(createDto.permisoId);
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${createDto.permisoId} no encontrado`);
    }

    // Verificar que la relación no exista ya
    const existeRelacion = await this.perfilTienePermisoRepository.exists(
      createDto.perfilId,
      createDto.permisoId
    );

    if (existeRelacion) {
      throw new ConflictException(
        `El perfil ${createDto.perfilId} ya tiene asignado el permiso ${createDto.permisoId}`
      );
    }

    // Crear la relación
    const entity = await this.perfilTienePermisoRepository.create({
      perfilId: createDto.perfilId,
      permisoId: createDto.permisoId,
    });

    // Buscar la entidad completa con relaciones para devolverla
    const perfilTienePermisoCompleto = await this.perfilTienePermisoRepository.findByPerfilIdAndPermisoId(
      entity.perfilId,
      entity.permisoId
    );

    if (!perfilTienePermisoCompleto) {
      throw new NotFoundException('La relación perfil-permiso no se encontró después de ser creada');
    }

    const model = PerfilTienePermiso.fromEntity(perfilTienePermisoCompleto);
    
    return new PerfilTienePermisoResponseDto({
      perfilId: model.perfilId,
      permisoId: model.permisoId,
      perfil: this.perfilService.mapToResponseDto(perfilTienePermisoCompleto.perfil),
      permiso: this.permisoService.mapToResponseDto(perfilTienePermisoCompleto.permiso),
    });
  }

  async removerPermisoDelPerfil(perfilId: string, permisoId: string): Promise<void> {
    if (!perfilId || !permisoId) {
      throw new BadRequestException('El ID del perfil y el ID del permiso son requeridos');
    }

    const existeRelacion = await this.perfilTienePermisoRepository.exists(perfilId, permisoId);
    
    if (!existeRelacion) {
      throw new NotFoundException(
        `La relación entre el perfil ${perfilId} y el permiso ${permisoId} no existe`
      );
    }

    const eliminado = await this.perfilTienePermisoRepository.delete(perfilId, permisoId);
    
    if (!eliminado) {
      throw new Error('Error al eliminar la relación perfil-permiso');
    }
  }

  async obtenerPermisosDePerfil(perfilId: string): Promise<PerfilTienePermisoResponseDto[]> {
    if (!perfilId) {
      throw new BadRequestException('El ID del perfil es requerido');
    }

    // Verificar que el perfil existe
    const perfil = await this.perfilService.findById(perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    const entities = await this.perfilTienePermisoRepository.findByPerfilId(perfilId);
    
    return entities.map(entity => {
      return new PerfilTienePermisoResponseDto({
        perfilId: entity.perfilId,
        permisoId: entity.permisoId,
        perfil: this.perfilService.mapToResponseDto(entity.perfil),
        permiso: this.permisoService.mapToResponseDto(entity.permiso),
      });
    });
  }

  async obtenerPerfilesConPermiso(permisoId: string): Promise<PerfilTienePermisoResponseDto[]> {
    if (!permisoId) {
      throw new BadRequestException('El ID del permiso es requerido');
    }

    // Verificar que el permiso existe
    const permiso = await this.permisoService.findById(permisoId);
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${permisoId} no encontrado`);
    }

    const entities = await this.perfilTienePermisoRepository.findByPermisoId(permisoId);
    
    return entities.map(entity => {
      return new PerfilTienePermisoResponseDto({
        perfilId: entity.perfilId,
        permisoId: entity.permisoId,
        perfil: this.perfilService.mapToResponseDto(entity.perfil),
        permiso: this.permisoService.mapToResponseDto(entity.permiso),
      });
    });
  }

  async obtenerTodasLasRelaciones(query?: PerfilTienePermisoQueryDto): Promise<PerfilTienePermisoResponseDto[]> {
    let entities;

    if (query?.perfilId && query?.permisoId) {
      const entity = await this.perfilTienePermisoRepository.findByPerfilIdAndPermisoId(
        query.perfilId,
        query.permisoId
      );
      entities = entity ? [entity] : [];
    } else if (query?.perfilId) {
      entities = await this.perfilTienePermisoRepository.findByPerfilId(query.perfilId);
    } else if (query?.permisoId) {
      entities = await this.perfilTienePermisoRepository.findByPermisoId(query.permisoId);
    } else {
      entities = await this.perfilTienePermisoRepository.findAll();
    }

    return entities.map(entity => {
      return new PerfilTienePermisoResponseDto({
        perfilId: entity.perfilId,
        permisoId: entity.permisoId,
        perfil: this.perfilService.mapToResponseDto(entity.perfil),
        permiso: this.permisoService.mapToResponseDto(entity.permiso),
      });
    });
  }

  async verificarPermisoEnPerfil(perfilId: string, permisoId: string): Promise<boolean> {
    if (!perfilId || !permisoId) {
      throw new BadRequestException('El ID del perfil y el ID del permiso son requeridos');
    }

    return await this.perfilTienePermisoRepository.exists(perfilId, permisoId);
  }

  async contarPermisosPorPerfil(perfilId: string): Promise<number> {
    if (!perfilId) {
      throw new BadRequestException('El ID del perfil es requerido');
    }

    return await this.perfilTienePermisoRepository.countByPerfilId(perfilId);
  }

  async contarPerfilesPorPermiso(permisoId: string): Promise<number> {
    if (!permisoId) {
      throw new BadRequestException('El ID del permiso es requerido');
    }

    return await this.perfilTienePermisoRepository.countByPermisoId(permisoId);
  }

  async removerTodosLosPermisosDelPerfil(perfilId: string): Promise<number> {
    if (!perfilId) {
      throw new BadRequestException('El ID del perfil es requerido');
    }

    // Verificar que el perfil existe
    const perfil = await this.perfilService.findById(perfilId);
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${perfilId} no encontrado`);
    }

    return await this.perfilTienePermisoRepository.deleteByPerfilId(perfilId);
  }

  async removerPermisoDeTodosLosPerfiles(permisoId: string): Promise<number> {
    if (!permisoId) {
      throw new BadRequestException('El ID del permiso es requerido');
    }

    // Verificar que el permiso existe
    const permiso = await this.permisoService.findById(permisoId);
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${permisoId} no encontrado`);
    }

    return await this.perfilTienePermisoRepository.deleteByPermisoId(permisoId);
  }
}