// services/paciente.service.ts
import { PacienteRepository } from '../repositories/paciente.repository';
import { PersonaRepository } from '../repositories/persona.repository';
import { ObraSocialRepository } from '../repositories/obra-social.repository';
import { Paciente } from '../models/paciente.model';
import { Persona } from '../models/persona.model';
import { ObraSocial } from '../models/obra-social.model';
import { PacienteEntity } from '../entities/paciente.entity';
import { 
  CreatePacienteDto, 
  UpdatePacienteDto, 
  PacienteResponseDto, 
  PacienteFiltersDto,
  BuscarPacienteDto 
} from '../dto/paciente.dto';
import { PersonaResponseDto } from '../dto/persona.dto';
import { ObraSocialResponseDto } from '../dto/obra-social.dto';

export class PacienteService {
  constructor(
    private pacienteRepository: PacienteRepository,
    private personaRepository: PersonaRepository,
    private obraSocialRepository: ObraSocialRepository
  ) {}

  // Crear un nuevo paciente
  async createPaciente(createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    // Verificar que la persona existe
    const persona = await this.personaRepository.findById(createPacienteDto.personaId);
    if (!persona) {
      throw new Error(`No se encontró una persona con el ID: ${createPacienteDto.personaId}`);
    }

    // Verificar que la obra social existe
    const obraSocial = await this.obraSocialRepository.findById(createPacienteDto.obraSocialId);
    if (!obraSocial) {
      throw new Error(`No se encontró una obra social con el ID: ${createPacienteDto.obraSocialId}`);
    }

    // Verificar que la persona no sea ya un paciente
    const existingPaciente = await this.pacienteRepository.findByPersonaId(createPacienteDto.personaId);
    if (existingPaciente) {
      throw new Error('Esta persona ya está registrada como paciente');
    }

    // Crear los modelos de dominio para validaciones adicionales
    const personaModel = Persona.fromEntity(persona);
    const obraSocialModel = ObraSocial.fromEntity(obraSocial);
    
    const pacienteModel = new Paciente({
      persona: personaModel,
      obraSocial: obraSocialModel
    });

    // Convertir a entidad y guardar
    const pacienteEntity = pacienteModel.toEntity() as PacienteEntity;
    pacienteEntity.persona = persona;
    pacienteEntity.obraSocial = obraSocial;
    
    const savedPaciente = await this.pacienteRepository.create(pacienteEntity);

    return this.mapToResponseDto(savedPaciente);
  }

  // Obtener todos los pacientes
  async getAllPacientes(filters?: PacienteFiltersDto): Promise<PacienteResponseDto[]> {
    const pacientes = await this.pacienteRepository.findAll(filters);
    return pacientes.map(paciente => this.mapToResponseDto(paciente));
  }

  // Obtener un paciente por ID
  async getPacienteById(id: string): Promise<PacienteResponseDto | null> {
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) {
      return null;
    }
    return this.mapToResponseDto(paciente);
  }

  // Obtener un paciente por persona ID
  async getPacienteByPersonaId(personaId: string): Promise<PacienteResponseDto | null> {
    const paciente = await this.pacienteRepository.findByPersonaId(personaId);
    if (!paciente) {
      return null;
    }
    return this.mapToResponseDto(paciente);
  }

  // Obtener pacientes por obra social
  async getPacientesByObraSocial(obraSocialId: string): Promise<PacienteResponseDto[]> {
    // Verificar que la obra social existe
    const obraSocial = await this.obraSocialRepository.findById(obraSocialId);
    if (!obraSocial) {
      throw new Error(`No se encontró una obra social con el ID: ${obraSocialId}`);
    }

    const pacientes = await this.pacienteRepository.findByObraSocialId(obraSocialId);
    return pacientes.map(paciente => this.mapToResponseDto(paciente));
  }

  // Buscar pacientes por término general
  async searchPacientes(searchDto: BuscarPacienteDto): Promise<PacienteResponseDto[]> {
    const pacientes = await this.pacienteRepository.searchPacientes(searchDto);
    return pacientes.map(paciente => this.mapToResponseDto(paciente));
  }

  // Actualizar un paciente
  async updatePaciente(id: string, updatePacienteDto: UpdatePacienteDto): Promise<PacienteResponseDto | null> {
    // Verificar que el paciente existe
    const existingPaciente = await this.pacienteRepository.findById(id);
    if (!existingPaciente) {
      throw new Error(`No se encontró un paciente con el ID: ${id}`);
    }

    // Preparar los datos para actualizar
    const updateData: Partial<PacienteEntity> = {};

    // Si se está actualizando la persona
    if (updatePacienteDto.personaId && updatePacienteDto.personaId !== existingPaciente.persona?.id) {
      const persona = await this.personaRepository.findById(updatePacienteDto.personaId);
      if (!persona) {
        throw new Error(`No se encontró una persona con el ID: ${updatePacienteDto.personaId}`);
      }

      // Verificar que la persona no sea ya un paciente (excluyendo el actual)
      const pacienteWithSamePersona = await this.pacienteRepository.findByPersonaId(updatePacienteDto.personaId);
      if (pacienteWithSamePersona && pacienteWithSamePersona.id !== id) {
        throw new Error('Esta persona ya está registrada como paciente');
      }

      updateData.persona = persona;
    }

    // Si se está actualizando la obra social
    if (updatePacienteDto.obraSocialId && updatePacienteDto.obraSocialId !== existingPaciente.obraSocial?.id) {
      const obraSocial = await this.obraSocialRepository.findById(updatePacienteDto.obraSocialId);
      if (!obraSocial) {
        throw new Error(`No se encontró una obra social con el ID: ${updatePacienteDto.obraSocialId}`);
      }

      updateData.obraSocial = obraSocial;
    }

    // Validar usando el modelo de dominio si hay datos para actualizar
    if (Object.keys(updateData).length > 0) {
      const personaParaValidar = updateData.persona ?? existingPaciente.persona;
      const obraSocialParaValidar = updateData.obraSocial ?? existingPaciente.obraSocial;

      // Crear modelos temporales para validar
      const personaModel = Persona.fromEntity(personaParaValidar);
      const obraSocialModel = ObraSocial.fromEntity(obraSocialParaValidar);
      
      // Esto lanzará errores si los datos no son válidos
      new Paciente({
        id: existingPaciente.id,
        persona: personaModel,
        obraSocial: obraSocialModel
      });
    }

    const updatedPaciente = await this.pacienteRepository.update(id, updateData);
    
    if (!updatedPaciente) {
      return null;
    }

    return this.mapToResponseDto(updatedPaciente);
  }

  // Eliminar un paciente
  async deletePaciente(id: string): Promise<boolean> {
    const existingPaciente = await this.pacienteRepository.findById(id);
    if (!existingPaciente) {
      throw new Error(`No se encontró un paciente con el ID: ${id}`);
    }

    return await this.pacienteRepository.delete(id);
  }

  // Obtener pacientes con paginación
  async getPacientesWithPagination(
    page: number = 1, 
    limit: number = 10, 
    filters?: PacienteFiltersDto
  ): Promise<{
    pacientes: PacienteResponseDto[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const result = await this.pacienteRepository.findWithPagination(page, limit, filters);
    
    return {
      pacientes: result.pacientes.map(paciente => this.mapToResponseDto(paciente)),
      pagination: {
        currentPage: page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: limit
      }
    };
  }

  // Obtener estadísticas de pacientes por obra social
  async getPacientesStatsByObraSocial(): Promise<{ obraSocialId: string; nombre: string; totalPacientes: number }[]> {
    return await this.pacienteRepository.getPatientsByObraSocialStats();
  }

  // Obtener pacientes recientes
  async getRecentPacientes(limit: number = 10): Promise<PacienteResponseDto[]> {
    const pacientes = await this.pacienteRepository.findRecentPacientes(limit);
    return pacientes.map(paciente => this.mapToResponseDto(paciente));
  }

  // Transferir paciente a otra obra social
  async transferirPacienteObraSocial(pacienteId: string, nuevaObraSocialId: string): Promise<PacienteResponseDto> {
    // Verificar que el paciente existe
    const paciente = await this.pacienteRepository.findById(pacienteId);
    if (!paciente) {
      throw new Error(`No se encontró un paciente con el ID: ${pacienteId}`);
    }

    // Verificar que la nueva obra social existe
    const nuevaObraSocial = await this.obraSocialRepository.findById(nuevaObraSocialId);
    if (!nuevaObraSocial) {
      throw new Error(`No se encontró una obra social con el ID: ${nuevaObraSocialId}`);
    }

    // Verificar que no sea la misma obra social
    if (paciente.obraSocial.id === nuevaObraSocialId) {
      throw new Error('El paciente ya pertenece a esta obra social');
    }

    const updatedPaciente = await this.pacienteRepository.update(pacienteId, {
      obraSocial: nuevaObraSocial
    });

    if (!updatedPaciente) {
      throw new Error('Error al transferir el paciente');
    }

    return this.mapToResponseDto(updatedPaciente);
  }

  // Método para mapear entidad a DTO de respuesta
  public mapToResponseDto(paciente: PacienteEntity): PacienteResponseDto {
    const personaDto = new PersonaResponseDto({
      id: paciente.persona.id,
      nombre: paciente.persona.nombre,
      apellido: paciente.persona.apellido,
      dni: paciente.persona.dni,
      fechaNacimiento: paciente.persona.fechaNacimiento,
    });

    const obraSocialDto = new ObraSocialResponseDto({
      id: paciente.obraSocial.id,
      nombre: paciente.obraSocial.nombre,
      activo: paciente.obraSocial.activo,
    });

    return new PacienteResponseDto({
      id: paciente.id,
      persona: personaDto,
      obraSocial: obraSocialDto
    });
  }

  // Método para obtener el modelo de dominio desde una entidad (si lo necesitas)
  getPacienteModel(paciente: PacienteEntity): Paciente {
    return Paciente.fromEntity(paciente);
  }
}