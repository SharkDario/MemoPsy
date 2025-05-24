// perfil.service.ts
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PerfilRepository } from '../repositories/perfil.repository';
import { CreatePerfilDto, UpdatePerfilDto, PerfilResponseDto } from '../dto/perfil.dto';
import { Perfil } from '../models/perfil.model';
import { PerfilEntity } from '../entities/perfil.entity';

export class PerfilService {
  constructor(private readonly perfilRepository: PerfilRepository) {}

  async create(createPerfilDto: CreatePerfilDto): Promise<PerfilResponseDto> {
    // Verificar si ya existe un perfil con el mismo nombre
    const existingPerfil = await this.perfilRepository.findByNombre(createPerfilDto.nombre);
    if (existingPerfil) {
      throw new ConflictException(`Ya existe un perfil con el nombre: ${createPerfilDto.nombre}`);
    }

    try {
      // Crear el modelo de dominio para validar
      const perfilModel = new Perfil({
        nombre: createPerfilDto.nombre,
        descripcion: createPerfilDto.descripcion,
      });

      // Convertir a entidad y crear en la base de datos
      const perfilEntity = await this.perfilRepository.create(perfilModel.toEntity());

      return this.mapToResponseDto(perfilEntity);
    } catch (error: any) {
      if (error.message?.includes('no puede estar vacío') || error.message?.includes('no puede estar vacía')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAll(): Promise<PerfilResponseDto[]> {
    const perfiles = await this.perfilRepository.findAll({
      order: { nombre: 'ASC' },
    });

    return perfiles.map(perfil => this.mapToResponseDto(perfil));
  }

  async findById(id: string): Promise<PerfilResponseDto> {
    const perfil = await this.perfilRepository.findById(id);
    
    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(perfil);
  }

  async update(id: string, updatePerfilDto: UpdatePerfilDto): Promise<PerfilResponseDto> {
    // Verificar si el perfil existe
    const existingPerfil = await this.perfilRepository.findById(id);
    if (!existingPerfil) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    // Si se está actualizando el nombre, verificar que no exista otro perfil con ese nombre
    if (updatePerfilDto.nombre) {
      const perfilWithSameName = await this.perfilRepository.existsByNombre(
        updatePerfilDto.nombre,
        id
      );
      if (perfilWithSameName) {
        throw new ConflictException(`Ya existe otro perfil con el nombre: ${updatePerfilDto.nombre}`);
      }
    }

    try {
      // Validar usando el modelo de dominio
      const perfilModel = Perfil.fromEntity(existingPerfil);
      if (updatePerfilDto.nombre) perfilModel.nombre = updatePerfilDto.nombre;
      if (updatePerfilDto.descripcion) perfilModel.descripcion = updatePerfilDto.descripcion;
    } catch (error: any) {
      if (error.message?.includes('no puede estar vacío') || error.message?.includes('no puede estar vacía')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const updatedPerfil = await this.perfilRepository.update(id, updatePerfilDto);
    
    if (!updatedPerfil) {
      throw new NotFoundException(`No se pudo actualizar el perfil con ID ${id}`);
    }

    return this.mapToResponseDto(updatedPerfil);
  }

  async remove(id: string): Promise<void> {
    // Verificar si el perfil existe
    const exists = await this.perfilRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    const deleted = await this.perfilRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`No se pudo eliminar el perfil con ID ${id}`);
    }
  }

  async search(searchTerm: string): Promise<PerfilResponseDto[]> {
    const perfiles = await this.perfilRepository.search(searchTerm);
    return perfiles.map(perfil => this.mapToResponseDto(perfil));
  }

  async count(): Promise<number> {
    return await this.perfilRepository.count();
  }

  public mapToResponseDto(entity: PerfilEntity): PerfilResponseDto {
    return new PerfilResponseDto({
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
    });
  }
}