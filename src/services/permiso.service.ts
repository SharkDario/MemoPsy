// permiso.service.ts
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PermisoRepository } from '../repositories/permiso.repository';
import { ModuloRepository } from '../repositories/modulo.repository';
import { AccionRepository } from '../repositories/accion.repository';
import { CreatePermisoDto, UpdatePermisoDto, PermisoResponseDto } from '../dto/permiso.dto';
import { Permiso } from '../models/permiso.model';
import { Modulo } from '../models/modulo.model';
import { Accion } from '../models/accion.model';
import { PermisoEntity } from '../entities/permiso.entity';

export class PermisoService {
  constructor(
    private readonly permisoRepository: PermisoRepository,
    private readonly moduloRepository: ModuloRepository,
    private readonly accionRepository: AccionRepository,
  ) {}

  async create(createPermisoDto: CreatePermisoDto): Promise<PermisoResponseDto> {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermiso = await this.permisoRepository.findByNombre(createPermisoDto.nombre);
    if (existingPermiso) {
      throw new ConflictException(`Ya existe un permiso con el nombre: ${createPermisoDto.nombre}`);
    }

    // Verificar que existan el módulo y la acción
    const [modulo, accion] = await Promise.all([
      this.moduloRepository.findById(createPermisoDto.moduloId),
      this.accionRepository.findById(createPermisoDto.accionId),
    ]);

    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${createPermisoDto.moduloId} no encontrado`);
    }

    if (!accion) {
      throw new NotFoundException(`Acción con ID ${createPermisoDto.accionId} no encontrada`);
    }

    // Verificar si ya existe un permiso para esta combinación módulo-acción
    const existingCombo = await this.permisoRepository.existsForModuloAndAccion(
      createPermisoDto.moduloId,
      createPermisoDto.accionId
    );

    if (existingCombo) {
      throw new ConflictException(
        `Ya existe un permiso para el módulo "${modulo.nombre}" y la acción "${accion.nombre}"`
      );
    }

    try {
      // Crear los modelos de dominio
      const moduloModel = Modulo.fromEntity(modulo);
      const accionModel = Accion.fromEntity(accion);

      // Crear el modelo de permiso para validar
      const permisoModel = new Permiso({
        nombre: createPermisoDto.nombre,
        descripcion: createPermisoDto.descripcion,
        modulo: moduloModel,
        accion: accionModel,
      });

      // Crear la entidad con las relaciones
      const permisoEntity = await this.permisoRepository.create({
        ...permisoModel.toEntity(),
        modulo: modulo,
        accion: accion,
      });

      return this.mapToResponseDto(permisoEntity);
    } catch (error: any) {
      if (error.message?.includes('no puede estar vacío') || error.message?.includes('no puede estar vacía')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAll(): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepository.findAll({
      order: { nombre: 'ASC' },
    });

    return permisos.map(permiso => this.mapToResponseDto(permiso));
  }

  async findById(id: string): Promise<PermisoResponseDto> {
    const permiso = await this.permisoRepository.findById(id);
    
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(permiso);
  }

  async findByModulo(moduloId: string): Promise<PermisoResponseDto[]> {
    // Verificar que el módulo existe
    const modulo = await this.moduloRepository.findById(moduloId);
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${moduloId} no encontrado`);
    }

    const permisos = await this.permisoRepository.findByModulo(moduloId);
    return permisos.map(permiso => this.mapToResponseDto(permiso));
  }

  async findByAccion(accionId: string): Promise<PermisoResponseDto[]> {
    // Verificar que la acción existe
    const accion = await this.accionRepository.findById(accionId);
    if (!accion) {
      throw new NotFoundException(`Acción con ID ${accionId} no encontrada`);
    }

    const permisos = await this.permisoRepository.findByAccion(accionId);
    return permisos.map(permiso => this.mapToResponseDto(permiso));
  }

  async update(id: string, updatePermisoDto: UpdatePermisoDto): Promise<PermisoResponseDto> {
    // Verificar si el permiso existe
    const existingPermiso = await this.permisoRepository.findById(id);
    if (!existingPermiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro permiso con ese nombre
    if (updatePermisoDto.nombre) {
      const permisoWithSameName = await this.permisoRepository.existsByNombre(
        updatePermisoDto.nombre,
        id
      );
      if (permisoWithSameName) {
        throw new ConflictException(`Ya existe otro permiso con el nombre: ${updatePermisoDto.nombre}`);
      }
    }

    // Verificar módulo y acción si se están actualizando
    const updateData: any = {};
    
    if (updatePermisoDto.moduloId) {
      const modulo = await this.moduloRepository.findById(updatePermisoDto.moduloId);
      if (!modulo) {
        throw new NotFoundException(`Módulo con ID ${updatePermisoDto.moduloId} no encontrado`);
      }
      updateData.modulo = modulo;
    }

    if (updatePermisoDto.accionId) {
      const accion = await this.accionRepository.findById(updatePermisoDto.accionId);
      if (!accion) {
        throw new NotFoundException(`Acción con ID ${updatePermisoDto.accionId} no encontrada`);
      }
      updateData.accion = accion;
    }

    // Verificar combinación módulo-acción si se está actualizando alguna de las dos
    if (updatePermisoDto.moduloId || updatePermisoDto.accionId) {
      const moduloId = updatePermisoDto.moduloId || existingPermiso.modulo.id;
      const accionId = updatePermisoDto.accionId || existingPermiso.accion.id;

      const existingCombo = await this.permisoRepository.existsForModuloAndAccion(
        moduloId,
        accionId,
        id
      );

      if (existingCombo) {
        const modulo = updateData.modulo || existingPermiso.modulo;
        const accion = updateData.accion || existingPermiso.accion;
        throw new ConflictException(
          `Ya existe otro permiso para el módulo "${modulo.nombre}" y la acción "${accion.nombre}"`
        );
      }
    }

    try {
      // Validar usando el modelo de dominio
      const permisoModel = Permiso.fromEntity(existingPermiso);
      if (updatePermisoDto.nombre) permisoModel.nombre = updatePermisoDto.nombre;
      if (updatePermisoDto.descripcion) permisoModel.descripcion = updatePermisoDto.descripcion;
    } catch (error: any) {
      if (error.message?.includes('no puede estar vacío') || error.message?.includes('no puede estar vacía')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    // Preparar datos para actualización
    const finalUpdateData = {
      ...updatePermisoDto,
      ...updateData,
    };

    const updatedPermiso = await this.permisoRepository.update(id, finalUpdateData);
    
    if (!updatedPermiso) {
      throw new NotFoundException(`No se pudo actualizar el permiso con ID ${id}`);
    }

    return this.mapToResponseDto(updatedPermiso);
  }

  async remove(id: string): Promise<void> {
    // Verificar si el permiso existe
    const exists = await this.permisoRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    const deleted = await this.permisoRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`No se pudo eliminar el permiso con ID ${id}`);
    }
  }

  async search(searchTerm: string): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepository.search(searchTerm);
    return permisos.map(permiso => this.mapToResponseDto(permiso));
  }

  async count(): Promise<number> {
    return await this.permisoRepository.count();
  }

  public mapToResponseDto(entity: PermisoEntity): PermisoResponseDto {
    return new PermisoResponseDto({
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      modulo: {
        id: entity.modulo.id,
        nombre: entity.modulo.nombre,
      },
      accion: {
        id: entity.accion.id,
        nombre: entity.accion.nombre,
      },
    });
  }
}