// services/persona.service.ts
import { PersonaRepository } from '../repositories/persona.repository';
import { Persona } from '../models/persona.model';
import { PersonaEntity } from '../entities/persona.entity';
import { 
  CreatePersonaDto, 
  UpdatePersonaDto, 
  PersonaResponseDto, 
  PersonaFiltersDto 
} from '../dto/persona.dto';

export class PersonaService {
  constructor(private personaRepository: PersonaRepository) {}

  // Crear una nueva persona
  async createPersona(createPersonaDto: CreatePersonaDto): Promise<PersonaResponseDto> {
    // Verificar si ya existe una persona con ese DNI
    const existingPersona = await this.personaRepository.findByDni(createPersonaDto.dni);
    if (existingPersona) {
      throw new Error(`Ya existe una persona con el DNI: ${createPersonaDto.dni}`);
    }

    // Convertir la fecha de string a Date
    const fechaNacimiento = new Date(createPersonaDto.fechaNacimiento);
    
    // Validar que la fecha no sea futura
    if (fechaNacimiento > new Date()) {
      throw new Error('La fecha de nacimiento no puede ser futura');
    }

    // Crear el modelo de dominio para validaciones adicionales
    const personaModel = new Persona({
      nombre: createPersonaDto.nombre,
      apellido: createPersonaDto.apellido,
      dni: createPersonaDto.dni,
      fechaNacimiento: fechaNacimiento
    });

    // Convertir a entidad y guardar
    const personaEntity = personaModel.toEntity() as PersonaEntity;
    const savedPersona = await this.personaRepository.create(personaEntity);

    return this.mapToResponseDto(savedPersona);
  }

  // Obtener todas las personas
  async getAllPersonas(filters?: PersonaFiltersDto): Promise<PersonaResponseDto[]> {
    const personas = await this.personaRepository.findAll(filters);
    return personas.map(persona => this.mapToResponseDto(persona));
  }

  // Obtener una persona por ID
  async getPersonaById(id: string): Promise<PersonaResponseDto | null> {
    const persona = await this.personaRepository.findById(id);
    if (!persona) {
      return null;
    }
    return this.mapToResponseDto(persona);
  }

  // Obtener una persona por DNI
  async getPersonaByDni(dni: string): Promise<PersonaResponseDto | null> {
    const persona = await this.personaRepository.findByDni(dni);
    if (!persona) {
      return null;
    }
    return this.mapToResponseDto(persona);
  }

  // Actualizar una persona
  async updatePersona(id: string, updatePersonaDto: UpdatePersonaDto): Promise<PersonaResponseDto | null> {
    // Verificar que la persona existe
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new Error(`No se encontró una persona con el ID: ${id}`);
    }

    // Si se está actualizando el DNI, verificar que no exista otro con el mismo DNI
    if (updatePersonaDto.dni && updatePersonaDto.dni !== existingPersona.dni) {
      const personaWithSameDni = await this.personaRepository.findByDni(updatePersonaDto.dni);
      if (personaWithSameDni && personaWithSameDni.id !== id) {
        throw new Error(`Ya existe una persona con el DNI: ${updatePersonaDto.dni}`);
      }
    }

    // Preparar los datos para actualizar
    const updateData: Partial<PersonaEntity> = {};

    if (updatePersonaDto.nombre !== undefined) {
      updateData.nombre = updatePersonaDto.nombre;
    }

    if (updatePersonaDto.apellido !== undefined) {
      updateData.apellido = updatePersonaDto.apellido;
    }

    if (updatePersonaDto.dni !== undefined) {
      updateData.dni = updatePersonaDto.dni;
    }

    if (updatePersonaDto.fechaNacimiento !== undefined) {
      const fechaNacimiento = new Date(updatePersonaDto.fechaNacimiento);
      
      // Validar que la fecha no sea futura
      if (fechaNacimiento > new Date()) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      
      updateData.fechaNacimiento = fechaNacimiento;
    }

    // Validar usando el modelo de dominio si hay datos para actualizar
    if (Object.keys(updateData).length > 0) {
      // Crear un modelo temporal con los datos actuales + las actualizaciones para validar
      const tempPersonaData = {
        id: existingPersona.id,
        nombre: updateData.nombre ?? existingPersona.nombre,
        apellido: updateData.apellido ?? existingPersona.apellido,
        dni: updateData.dni ?? existingPersona.dni,
        fechaNacimiento: updateData.fechaNacimiento ?? existingPersona.fechaNacimiento
      };

      // Esto lanzará errores si los datos no son válidos
      new Persona(tempPersonaData);
    }

    const updatedPersona = await this.personaRepository.update(id, updateData);
    
    if (!updatedPersona) {
      return null;
    }

    return this.mapToResponseDto(updatedPersona);
  }

  // Eliminar una persona
  async deletePersona(id: string): Promise<boolean> {
    const existingPersona = await this.personaRepository.findById(id);
    if (!existingPersona) {
      throw new Error(`No se encontró una persona con el ID: ${id}`);
    }

    return await this.personaRepository.delete(id);
  }

  // Obtener personas con paginación
  async getPersonasWithPagination(
    page: number = 1, 
    limit: number = 10, 
    filters?: PersonaFiltersDto
  ): Promise<{
    personas: PersonaResponseDto[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const result = await this.personaRepository.findWithPagination(page, limit, filters);
    
    return {
      personas: result.personas.map(persona => this.mapToResponseDto(persona)),
      pagination: {
        currentPage: page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: limit
      }
    };
  }

  // Método privado para mapear entidad a DTO de respuesta
  public mapToResponseDto(persona: PersonaEntity): PersonaResponseDto {
    return new PersonaResponseDto({
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      dni: persona.dni,
      fechaNacimiento: persona.fechaNacimiento,
    });
  }

  // Método para obtener el modelo de dominio desde una entidad (si lo necesitas)
  getPersonaModel(persona: PersonaEntity): Persona {
    return Persona.fromEntity(persona);
  }
}