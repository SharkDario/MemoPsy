// services/paciente-tiene-informe.service.ts
// services/paciente-tiene-informe.service.ts
import { PacienteTieneInformeRepository } from '../repositories/paciente-tiene-informe.repository';
import { PacienteService } from './paciente.service';
import { InformeService } from './informe.service';
import { PacienteTieneInforme } from '../models/paciente-tiene-informe.model';
import { Paciente, Persona, Psicologo, ObraSocial, Informe } from '../models/index';
import { PacienteTieneInformeEntity } from '../entities/paciente-tiene-informe.entity';
import { 
  CreatePacienteTieneInformeDto,
  UpdatePacienteTieneInformeDto,
  PacienteTieneInformeResponseDto,
  PacienteTieneInformeFiltersDto,
  BuscarPacienteTieneInformeDto,
  PaginatedPacienteTieneInformeResponseDto,
  PacienteTieneInformeStatsDto,
  DeletePacienteTieneInformeDto
} from '../dto/paciente-tiene-informe.dto';

export class PacienteTieneInformeService {
  constructor(
    private pacienteTieneInformeRepository: PacienteTieneInformeRepository,
    private pacienteService: PacienteService,
    private informeService: InformeService
  ) {}

  // Crear una nueva relación paciente-informe
  async create(createDto: CreatePacienteTieneInformeDto): Promise<PacienteTieneInformeResponseDto> {
    try {
      // Verificar que el paciente existe usando el servicio
      const pacienteDto = await this.pacienteService.getPacienteById(createDto.pacienteId);
      if (!pacienteDto) {
        throw new Error('El paciente especificado no existe');
      }

      // Verificar que el informe existe usando el servicio
      const informeDto = await this.informeService.findById(createDto.informeId);
      if (!informeDto) {
        throw new Error('El informe especificado no existe');
      }

      // Verificar que la relación no existe ya
      const existingRelation = await this.pacienteTieneInformeRepository.exists(
        createDto.pacienteId, 
        createDto.informeId
      );
      if (existingRelation) {
        throw new Error('La relación entre el paciente y el informe ya existe');
      }

      // Crear el modelo de relación para validaciones
      // Necesitamos convertir los DTOs de vuelta a modelos para la validación
      const pacienteModel = new Paciente({
        id: pacienteDto.id,
        persona: Persona.fromEntity(pacienteDto.persona),
        obraSocial: ObraSocial.fromEntity(pacienteDto.obraSocial) //pacienteDto.obraSocial
      });

      const informeModel = new Informe({
        id: informeDto.id,
        titulo: informeDto.titulo,
        contenido: informeDto.contenido,
        fechaCreacion: informeDto.fechaCreacion,
        esPrivado: informeDto.esPrivado,
        psicologo: informeDto.psicologo && informeDto.psicologo.persona 
          ? Psicologo.fromEntity({
              ...informeDto.psicologo,
              persona: Persona.fromEntity(informeDto.psicologo.persona)
            }) 
          : undefined
      });

      const relacionModel = new PacienteTieneInforme({
        pacienteId: createDto.pacienteId,
        informeId: createDto.informeId,
        paciente: pacienteModel,
        informe: informeModel
      });

      // Crear la relación en el repositorio
      const relacionEntity = await this.pacienteTieneInformeRepository.create({
        pacienteId: createDto.pacienteId,
        informeId: createDto.informeId
      });

      // Buscar la relación completa con todas las relaciones cargadas
      const savedRelacion = await this.pacienteTieneInformeRepository.findByIds(
        createDto.pacienteId, 
        createDto.informeId
      );

      if (!savedRelacion) {
        throw new Error('Error al recuperar la relación creada');
      }

      return this.mapToResponseDto(savedRelacion);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al crear relación paciente-informe: ${error.message}`);
      }
      throw new Error('Error desconocido al crear relación paciente-informe');
    }
  }

  // Obtener todas las relaciones con filtros opcionales
  async findAll(filters?: PacienteTieneInformeFiltersDto): Promise<PacienteTieneInformeResponseDto[]> {
    const relaciones = await this.pacienteTieneInformeRepository.findAll(filters);
    return relaciones.map(relacion => this.mapToResponseDto(relacion));
  }

  // Obtener una relación específica por IDs
  async findByIds(pacienteId: string, informeId: string): Promise<PacienteTieneInformeResponseDto | null> {
    const relacion = await this.pacienteTieneInformeRepository.findByIds(pacienteId, informeId);
    if (!relacion) {
      return null;
    }
    return this.mapToResponseDto(relacion);
  }

  // Obtener todos los informes de un paciente
  async getInformesByPacienteId(pacienteId: string): Promise<PacienteTieneInformeResponseDto[]> {
    // Verificar que el paciente existe usando el servicio
    const pacienteDto = await this.pacienteService.getPacienteById(pacienteId);
    if (!pacienteDto) {
      throw new Error('El paciente especificado no existe');
    }

    const relaciones = await this.pacienteTieneInformeRepository.findInformesByPacienteId(pacienteId);
    return relaciones.map(relacion => this.mapToResponseDto(relacion));
  }

  // Obtener todos los pacientes que tienen un informe específico
  async getPacientesByInformeId(informeId: string): Promise<PacienteTieneInformeResponseDto[]> {
    // Verificar que el informe existe usando el servicio
    const informeDto = await this.informeService.findById(informeId);
    if (!informeDto) {
      throw new Error('El informe especificado no existe');
    }

    const relaciones = await this.pacienteTieneInformeRepository.findPacientesByInformeId(informeId);
    return relaciones.map(relacion => this.mapToResponseDto(relacion));
  }

  // Búsqueda avanzada
  async search(searchDto: BuscarPacienteTieneInformeDto): Promise<PacienteTieneInformeResponseDto[]> {
    const relaciones = await this.pacienteTieneInformeRepository.search(searchDto);
    return relaciones.map(relacion => this.mapToResponseDto(relacion));
  }

  // Actualizar una relación (cambiar paciente o informe)
  async update(
    currentPacienteId: string, 
    currentInformeId: string, 
    updateDto: UpdatePacienteTieneInformeDto
  ): Promise<PacienteTieneInformeResponseDto> {
    try {
      // Verificar que la relación actual existe
      const existingRelacion = await this.pacienteTieneInformeRepository.findByIds(
        currentPacienteId, 
        currentInformeId
      );
      if (!existingRelacion) {
        throw new Error('La relación especificada no existe');
      }

      // Si se quiere cambiar el paciente, verificar que existe
      if (updateDto.pacienteId && updateDto.pacienteId !== currentPacienteId) {
        const nuevoPacienteDto = await this.pacienteService.getPacienteById(updateDto.pacienteId);
        if (!nuevoPacienteDto) {
          throw new Error('El nuevo paciente especificado no existe');
        }
      }

      // Si se quiere cambiar el informe, verificar que existe
      if (updateDto.informeId && updateDto.informeId !== currentInformeId) {
        const nuevoInformeDto = await this.informeService.findById(updateDto.informeId);
        if (!nuevoInformeDto) {
          throw new Error('El nuevo informe especificado no existe');
        }
      }

      const newPacienteId = updateDto.pacienteId || currentPacienteId;
      const newInformeId = updateDto.informeId || currentInformeId;

      // Si los IDs cambiaron, verificar que la nueva relación no existe
      if (newPacienteId !== currentPacienteId || newInformeId !== currentInformeId) {
        const newRelationExists = await this.pacienteTieneInformeRepository.exists(
          newPacienteId, 
          newInformeId
        );
        if (newRelationExists) {
          throw new Error('Ya existe una relación con los nuevos datos especificados');
        }

        // Eliminar la relación antigua
        await this.pacienteTieneInformeRepository.delete(currentPacienteId, currentInformeId);

        // Crear la nueva relación
        await this.pacienteTieneInformeRepository.create({
          pacienteId: newPacienteId,
          informeId: newInformeId
        });
      }

      // Obtener la relación actualizada
      const updatedRelacion = await this.pacienteTieneInformeRepository.findByIds(
        newPacienteId, 
        newInformeId
      );

      if (!updatedRelacion) {
        throw new Error('Error al recuperar la relación actualizada');
      }

      return this.mapToResponseDto(updatedRelacion);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al actualizar relación paciente-informe: ${error.message}`);
      }
      throw new Error('Error desconocido al actualizar relación paciente-informe');
    }
  }

  // Eliminar una relación
  async delete(deleteDto: DeletePacienteTieneInformeDto): Promise<boolean> {
    // Verificar que la relación existe
    const existingRelacion = await this.pacienteTieneInformeRepository.findByIds(
      deleteDto.pacienteId, 
      deleteDto.informeId
    );
    if (!existingRelacion) {
      throw new Error('La relación especificada no existe');
    }

    return await this.pacienteTieneInformeRepository.delete(
      deleteDto.pacienteId, 
      deleteDto.informeId
    );
  }

  // Verificar si existe una relación específica
  async exists(pacienteId: string, informeId: string): Promise<boolean> {
    return await this.pacienteTieneInformeRepository.exists(pacienteId, informeId);
  }

  // Obtener relaciones con paginación
  async findWithPagination(
    page: number = 1, 
    limit: number = 10, 
    filters?: PacienteTieneInformeFiltersDto
  ): Promise<PaginatedPacienteTieneInformeResponseDto> {
    const result = await this.pacienteTieneInformeRepository.findWithPagination(page, limit, filters);
    
    const relaciones = result.relaciones.map(relacion => this.mapToResponseDto(relacion));

    return new PaginatedPacienteTieneInformeResponseDto({
      data: relaciones,
      total: result.total,
      page,
      limit,
      totalPages: result.totalPages
    });
  }

  // Obtener estadísticas
  async getStats(): Promise<PacienteTieneInformeStatsDto> {
    const stats = await this.pacienteTieneInformeRepository.getStats();
    return new PacienteTieneInformeStatsDto(stats);
  }

  // Contar informes por paciente
  async countInformesByPaciente(pacienteId: string): Promise<number> {
    // Verificar que el paciente existe usando el servicio
    const pacienteDto = await this.pacienteService.getPacienteById(pacienteId);
    if (!pacienteDto) {
      throw new Error('El paciente especificado no existe');
    }

    return await this.pacienteTieneInformeRepository.countInformesByPaciente(pacienteId);
  }

  // Contar pacientes por informe
  async countPacientesByInforme(informeId: string): Promise<number> {
    // Verificar que el informe existe usando el servicio
    const informeDto = await this.informeService.findById(informeId);
    if (!informeDto) {
      throw new Error('El informe especificado no existe');
    }

    return await this.pacienteTieneInformeRepository.countPacientesByInforme(informeId);
  }

  // Asignar informe a múltiples pacientes
  async assignInformeToMultiplePacientes(
    informeId: string, 
    pacienteIds: string[]
  ): Promise<PacienteTieneInformeResponseDto[]> {
    // Verificar que el informe existe
    const informeDto = await this.informeService.findById(informeId);
    if (!informeDto) {
      throw new Error('El informe especificado no existe');
    }

    const results: PacienteTieneInformeResponseDto[] = [];
    const errors: string[] = [];

    for (const pacienteId of pacienteIds) {
      try {
        // Verificar que el paciente existe
        const pacienteDto = await this.pacienteService.getPacienteById(pacienteId);
        if (!pacienteDto) {
          errors.push(`Paciente ${pacienteId} no encontrado`);
          continue;
        }

        // Verificar que la relación no existe
        const exists = await this.pacienteTieneInformeRepository.exists(pacienteId, informeId);
        if (exists) {
          errors.push(`Paciente ${pacienteId} ya tiene asignado este informe`);
          continue;
        }

        // Crear la relación
        const result = await this.create({ pacienteId, informeId });
        results.push(result);
      } catch (error) {
        errors.push(`Error con paciente ${pacienteId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`Errores al asignar informe: ${errors.join(', ')}`);
    }

    return results;
  }

  // Asignar múltiples informes a un paciente
  async assignMultipleInformesToPaciente(
    pacienteId: string, 
    informeIds: string[]
  ): Promise<PacienteTieneInformeResponseDto[]> {
    // Verificar que el paciente existe
    const pacienteDto = await this.pacienteService.getPacienteById(pacienteId);
    if (!pacienteDto) {
      throw new Error('El paciente especificado no existe');
    }

    const results: PacienteTieneInformeResponseDto[] = [];
    const errors: string[] = [];

    for (const informeId of informeIds) {
      try {
        // Verificar que el informe existe
        const informeDto = await this.informeService.findById(informeId);
        if (!informeDto) {
          errors.push(`Informe ${informeId} no encontrado`);
          continue;
        }

        // Verificar que la relación no existe
        const exists = await this.pacienteTieneInformeRepository.exists(pacienteId, informeId);
        if (exists) {
          errors.push(`Informe ${informeId} ya está asignado a este paciente`);
          continue;
        }

        // Crear la relación
        const result = await this.create({ pacienteId, informeId });
        results.push(result);
      } catch (error) {
        errors.push(`Error con informe ${informeId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw new Error(`Errores al asignar informes: ${errors.join(', ')}`);
    }

    return results;
  }

  // Remover informe de múltiples pacientes
  async removeInformeFromMultiplePacientes(
    informeId: string, 
    pacienteIds: string[]
  ): Promise<{ removed: number; errors: string[] }> {
    // Verificar que el informe existe
    const informeDto = await this.informeService.findById(informeId);
    if (!informeDto) {
      throw new Error('El informe especificado no existe');
    }

    let removed = 0;
    const errors: string[] = [];

    for (const pacienteId of pacienteIds) {
      try {
        const success = await this.pacienteTieneInformeRepository.delete(pacienteId, informeId);
        if (success) {
          removed++;
        } else {
          errors.push(`No se pudo remover la relación para el paciente ${pacienteId}`);
        }
      } catch (error) {
        errors.push(`Error con paciente ${pacienteId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return { removed, errors };
  }

  // Mapear entidad a DTO de respuesta
  private mapToResponseDto(entity: PacienteTieneInformeEntity): PacienteTieneInformeResponseDto {
    // Reutilizar los métodos de mapeo de los otros servicios
    const pacienteDto = this.pacienteService.mapToResponseDto(entity.paciente);
    const informeDto = this.informeService.mapToResponseDto(entity.informe);

    return new PacienteTieneInformeResponseDto({
      pacienteId: entity.pacienteId,
      informeId: entity.informeId,
      paciente: pacienteDto,
      informe: informeDto
    });
  }

  // Método para obtener el modelo de dominio desde una entidad
  getPacienteTieneInformeModel(entity: PacienteTieneInformeEntity): PacienteTieneInforme {
    return PacienteTieneInforme.fromEntity(entity);
  }
}

/*
import { DataSource } from 'typeorm';
import { PacienteTieneInformeRepository } from '../repositories/paciente-tiene-informe.repository';
import { PacienteRepository } from '../repositories/paciente.repository';
import { InformeRepository } from '../repositories/informe.repository';
import { PacienteTieneInforme } from '../models/paciente-tiene-informe.model';
import { PacienteTieneInformeEntity } from '../entities/paciente-tiene-informe.entity';
import {
  CreatePacienteTieneInformeDto,
  UpdatePacienteTieneInformeDto,
  PacienteTieneInformeResponseDto,
  PacienteTieneInformeFiltersDto,
  BuscarPacienteTieneInformeDto,
  PaginatedPacienteTieneInformeResponseDto,
  PacienteTieneInformeStatsDto,
  DeletePacienteTieneInformeDto
} from '../dto/paciente-tiene-informe.dto';
import { PacienteResponseDto } from '../dto/paciente.dto';
import { InformeResponseDto } from '../dto/informe.dto';
import { PersonaResponseDto } from '../dto/persona.dto';
import { ObraSocialResponseDto } from '../dto/obra-social.dto';
import { PsicologoResponseDto } from '../dto/psicologo.dto';

export class PacienteTieneInformeService {
    private pacienteTieneInformeRepository: PacienteTieneInformeRepository;
    private pacienteRepository: PacienteRepository;
    private informeRepository: InformeRepository;

    constructor(dataSource: DataSource) {
        this.pacienteTieneInformeRepository = new PacienteTieneInformeRepository(dataSource);
        this.pacienteRepository = new PacienteRepository(dataSource);
        this.informeRepository = new InformeRepository(dataSource);
    }

    // Crear una nueva relación paciente-informe
    async create(createDto: CreatePacienteTieneInformeDto): Promise<PacienteTieneInformeResponseDto> {
        // Verificar que el paciente existe
        const pacienteExists = await this.pacienteRepository.findById(createDto.pacienteId);
        if (!pacienteExists) {
        throw new Error('El paciente especificado no existe');
        }

        // Verificar que el informe existe
        const informeExists = await this.informeRepository.findById(createDto.informeId);
        if (!informeExists) {
        throw new Error('El informe especificado no existe');
        }

        // Verificar que la relación no existe ya
        const existingRelation = await this.pacienteTieneInformeRepository.exists(
        createDto.pacienteId, 
        createDto.informeId
        );
        if (existingRelation) {
        throw new Error('La relación entre el paciente e informe ya existe');
        }

        const relationData: Partial<PacienteTieneInformeEntity> = {
        pacienteId: createDto.pacienteId,
        informeId: createDto.informeId
        };

        const createdRelation = await this.pacienteTieneInformeRepository.create(relationData);
        
        // Obtener la relación completa con todas las entidades relacionadas
        const fullRelation = await this.pacienteTieneInformeRepository.findByIds(
        createdRelation.pacienteId, 
        createdRelation.informeId
        );

        if (!fullRelation) {
        throw new Error('Error al obtener la relación creada');
        }

        return this.mapToResponseDto(fullRelation);
    }

    // Obtener todas las relaciones con filtros opcionales
    async findAll(filters?: PacienteTieneInformeFiltersDto): Promise<PacienteTieneInformeResponseDto[]> {
        const relations = await this.pacienteTieneInformeRepository.findAll(filters);
        return relations.map(relation => this.mapToResponseDto(relation));
    }

    // Obtener una relación específica por IDs
    async findByIds(pacienteId: string, informeId: string): Promise<PacienteTieneInformeResponseDto | null> {
        const relation = await this.pacienteTieneInformeRepository.findByIds(pacienteId, informeId);
        return relation ? this.mapToResponseDto(relation) : null;
    }

    // Obtener todos los informes de un paciente
    async findInformesByPacienteId(pacienteId: string): Promise<PacienteTieneInformeResponseDto[]> {
        const relations = await this.pacienteTieneInformeRepository.findInformesByPacienteId(pacienteId);
        return relations.map(relation => this.mapToResponseDto(relation));
    }

    // Obtener todos los pacientes que tienen un informe específico
    async findPacientesByInformeId(informeId: string): Promise<PacienteTieneInformeResponseDto[]> {
        const relations = await this.pacienteTieneInformeRepository.findPacientesByInformeId(informeId);
        return relations.map(relation => this.mapToResponseDto(relation));
    }

    // Búsqueda avanzada
    async search(searchDto: BuscarPacienteTieneInformeDto): Promise<PacienteTieneInformeResponseDto[]> {
        const relations = await this.pacienteTieneInformeRepository.search(searchDto);
        return relations.map(relation => this.mapToResponseDto(relation));
    }

    // Actualizar una relación (cambiar paciente o informe)
    async update(
        pacienteId: string, 
        informeId: string, 
        updateDto: UpdatePacienteTieneInformeDto
    ): Promise<PacienteTieneInformeResponseDto | null> {
        // Verificar que la relación existe
        const existingRelation = await this.pacienteTieneInformeRepository.findByIds(pacienteId, informeId);
        if (!existingRelation) {
        throw new Error('La relación especificada no existe');
        }

        // Si se está cambiando el paciente, verificar que existe
        if (updateDto.pacienteId && updateDto.pacienteId !== pacienteId) {
        const pacienteExists = await this.pacienteRepository.findById(updateDto.pacienteId);
        if (!pacienteExists) {
            throw new Error('El nuevo paciente especificado no existe');
        }
        }

        // Si se está cambiando el informe, verificar que existe
        if (updateDto.informeId && updateDto.informeId !== informeId) {
        const informeExists = await this.informeRepository.findById(updateDto.informeId);
        if (!informeExists) {
            throw new Error('El nuevo informe especificado no existe');
        }
        }

        // Si se están cambiando ambos IDs, verificar que la nueva relación no existe
        if (updateDto.pacienteId && updateDto.informeId) {
        const newRelationExists = await this.pacienteTieneInformeRepository.exists(
            updateDto.pacienteId,
            updateDto.informeId
        );
            if (newRelationExists) {
                throw new Error('La nueva relación entre el paciente e informe ya existe');
            }
        }
    }

    // Mapear entidad a DTO de respuesta
  public mapToResponseDto(entity: any): PacienteTieneInformeResponseDto {
    return {
      pacienteId: entity.pacienteId,
      informeId: entity.informeId,
      paciente: this.mapPacienteToResponseDto(entity.paciente),
      informe: this.mapInformeToResponseDto(entity.informe)
    };
  }

  private mapPacienteToResponseDto(paciente: any): PacienteResponseDto {
    return {
      id: paciente.id,
      persona: paciente.persona,
      obraSocial: paciente.obraSocial
    };
  }

  private mapInformeToResponseDto(informe: any): InformeResponseDto {
    return {
      id: informe.id,
      titulo: informe.titulo,
      contenido: informe.contenido,
        fechaCreacion: informe.fechaCreacion,
        esPrivado: informe.esPrivado,
    };
  }
    
}
  */