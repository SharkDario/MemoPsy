// modulo.service.ts
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ModuloRepository } from '../repositories/modulo.repository';
import { CreateModuloDto, UpdateModuloDto, ModuloResponseDto } from '../dto/modulo.dto';
import { Modulo } from '../models/modulo.model';
import { ModuloEntity } from '../entities/modulo.entity';

export class ModuloService {
  constructor(private readonly moduloRepository: ModuloRepository) {}

  async create(createModuloDto: CreateModuloDto): Promise<ModuloResponseDto> {
    // Verificar si ya existe un módulo con el mismo nombre
    const existingModulo = await this.moduloRepository.findByNombre(createModuloDto.nombre);
    if (existingModulo) {
      throw new ConflictException(`Ya existe un módulo con el nombre: ${createModuloDto.nombre}`);
    }

    try {
      // Crear el modelo de dominio para validar
      const moduloModel = new Modulo({
        nombre: createModuloDto.nombre,
      });

      // Convertir a entidad y crear en la base de datos
      const moduloEntity = await this.moduloRepository.create(moduloModel.toEntity());

      return this.mapToResponseDto(moduloEntity);
    } catch (error: any) {
      if (error.message?.includes('El nombre no puede estar vacío')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAll(): Promise<ModuloResponseDto[]> {
    const modulos = await this.moduloRepository.findAll({
      order: { nombre: 'ASC' },
    });

    return modulos.map(modulo => this.mapToResponseDto(modulo));
  }

  async findOne(id: string): Promise<ModuloResponseDto> {
    const modulo = await this.moduloRepository.findById(id);
    
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(modulo);
  }

  async update(id: string, updateModuloDto: UpdateModuloDto): Promise<ModuloResponseDto> {
    // Verificar si el módulo existe
    const existingModulo = await this.moduloRepository.findById(id);
    if (!existingModulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro módulo con ese nombre
    if (updateModuloDto.nombre) {
      const moduloWithSameName = await this.moduloRepository.existsByNombre(
        updateModuloDto.nombre,
        id
      );
      if (moduloWithSameName) {
        throw new ConflictException(`Ya existe otro módulo con el nombre: ${updateModuloDto.nombre}`);
      }

      try {
        // Validar usando el modelo de dominio
        const moduloModel = Modulo.fromEntity(existingModulo);
        moduloModel.nombre = updateModuloDto.nombre;
      } catch (error: any) {
        if (error.message?.includes('El nombre no puede estar vacío')) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }
    }

    const updatedModulo = await this.moduloRepository.update(id, updateModuloDto);
    
    if (!updatedModulo) {
      throw new NotFoundException(`No se pudo actualizar el módulo con ID ${id}`);
    }

    return this.mapToResponseDto(updatedModulo);
  }

  async remove(id: string): Promise<void> {
    // Verificar si el módulo existe
    const exists = await this.moduloRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    const deleted = await this.moduloRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`No se pudo eliminar el módulo con ID ${id}`);
    }
  }

  async count(): Promise<number> {
    return await this.moduloRepository.count();
  }

  public mapToResponseDto(entity: ModuloEntity): ModuloResponseDto {
    return new ModuloResponseDto({
      id: entity.id,
      nombre: entity.nombre,
    });
  }
}