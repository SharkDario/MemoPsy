// repositories/estado.repository.ts
import { Repository, DataSource } from 'typeorm';
import { EstadoEntity } from '../entities/estado.entity';
import { Estado } from '../models/estado.model';
import { CreateEstadoDto, UpdateEstadoDto } from '../dto/estado.dto';

export interface IEstadoRepository {
  findAll(): Promise<Estado[]>;
  findById(id: string): Promise<Estado | null>;
  findByNombre(nombre: string): Promise<Estado | null>;
  create(createDto: CreateEstadoDto): Promise<Estado>;
  update(id: string, updateDto: UpdateEstadoDto): Promise<Estado | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export class EstadoRepository implements IEstadoRepository {
  private readonly repository: Repository<EstadoEntity>;
  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(EstadoEntity)
  }

  async findAll(): Promise<Estado[]> {
    try {
      const entities = await this.repository.find({
        order: { nombre: 'ASC' }
      });
      return entities.map(entity => Estado.fromEntity(entity));
    } catch (error) {
      throw new Error(`Error al obtener estados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findById(id: string): Promise<Estado | null> {
    try {
      const entity = await this.repository.findOne({ where: { id } });
      return entity ? Estado.fromEntity(entity) : null;
    } catch (error) {
      throw new Error(`Error al buscar estado por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findByNombre(nombre: string): Promise<Estado | null> {
    try {
      const entity = await this.repository.findOne({ 
        where: { nombre: nombre.trim() } 
      });
      return entity ? Estado.fromEntity(entity) : null;
    } catch (error) {
      throw new Error(`Error al buscar estado por nombre: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async create(createDto: CreateEstadoDto): Promise<Estado> {
    try {
      // Verificar si ya existe un estado con el mismo nombre
      const existingEstado = await this.findByNombre(createDto.nombre);
      if (existingEstado) {
        throw new Error('Ya existe un estado con este nombre');
      }

      const newEstado = new Estado({
        nombre: createDto.nombre.trim()
      });

      const entity = this.repository.create(newEstado.toEntity());
      const savedEntity = await this.repository.save(entity);
      
      return Estado.fromEntity(savedEntity);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Error al crear estado: ${error}`);
    }
  }

  async update(id: string, updateDto: UpdateEstadoDto): Promise<Estado | null> {
    try {
      const existingEntity = await this.repository.findOne({ where: { id } });
      if (!existingEntity) {
        return null;
      }

      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (updateDto.nombre && updateDto.nombre.trim() !== existingEntity.nombre) {
        const estadoWithSameName = await this.findByNombre(updateDto.nombre);
        if (estadoWithSameName && estadoWithSameName.id !== id) {
          throw new Error('Ya existe un estado con este nombre');
        }
      }

      // Crear modelo Estado para validaciones
      const estadoModel = Estado.fromEntity(existingEntity);
      
      // Actualizar solo los campos proporcionados
      if (updateDto.nombre !== undefined) {
        estadoModel.nombre = updateDto.nombre.trim();
      }

      // Actualizar entidad
      await this.repository.update(id, estadoModel.toEntity());
      
      // Obtener la entidad actualizada
      const updatedEntity = await this.repository.findOne({ where: { id } });
      return updatedEntity ? Estado.fromEntity(updatedEntity) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Error al actualizar estado: ${error}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(`Error al eliminar estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      throw new Error(`Error al verificar existencia del estado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async count(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      throw new Error(`Error al contar estados: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}