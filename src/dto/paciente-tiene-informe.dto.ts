// dto/paciente-tiene-informe.dto.ts
import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PacienteResponseDto } from './paciente.dto';
import { InformeResponseDto } from './informe.dto';

// DTO para crear una relación paciente-informe
export class CreatePacienteTieneInformeDto {
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  pacienteId: string;

  @IsUUID('4', { message: 'El ID del informe debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del informe es requerido' })
  informeId: string;
}

// DTO para actualizar una relación paciente-informe
export class UpdatePacienteTieneInformeDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  pacienteId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del informe debe ser un UUID válido' })
  informeId?: string;
}

// DTO para la respuesta (lo que se devuelve al cliente)
export class PacienteTieneInformeResponseDto {
  pacienteId: string;
  informeId: string;
  paciente: PacienteResponseDto;
  informe: InformeResponseDto;

  constructor(data: {
    pacienteId: string;
    informeId: string;
    paciente: PacienteResponseDto;
    informe: InformeResponseDto;
  }) {
    this.pacienteId = data.pacienteId;
    this.informeId = data.informeId;
    this.paciente = data.paciente;
    this.informe = data.informe;
  }
}

// DTO para filtros de búsqueda
export class PacienteTieneInformeFiltersDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  pacienteId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del informe debe ser un UUID válido' })
  informeId?: string;

  // Filtros por datos del paciente
  @IsOptional()
  @IsString()
  nombrePaciente?: string;

  @IsOptional()
  @IsString()
  apellidoPaciente?: string;

  @IsOptional()
  @IsString()
  dniPaciente?: string;

  // Filtros por datos del informe
  @IsOptional()
  @IsString()
  tituloInforme?: string;

  @IsOptional()
  @IsString()
  contenidoInforme?: string;

  // Filtros por datos del psicólogo del informe
  @IsOptional()
  @IsUUID('4', { message: 'El ID del psicólogo debe ser un UUID válido' })
  psicologoId?: string;

  @IsOptional()
  @IsString()
  nombrePsicologo?: string;

  @IsOptional()
  @IsString()
  apellidoPsicologo?: string;

  // Filtros por obra social del paciente
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la obra social debe ser un UUID válido' })
  obraSocialId?: string;

  @IsOptional()
  @IsString()
  nombreObraSocial?: string;
}

// DTO para búsqueda avanzada
export class BuscarPacienteTieneInformeDto {
  @IsOptional()
  @IsString()
  termino?: string; // Busca en nombre de paciente, título de informe, etc.

  @IsOptional()
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  pacienteId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del informe debe ser un UUID válido' })
  informeId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del psicólogo debe ser un UUID válido' })
  psicologoId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la obra social debe ser un UUID válido' })
  obraSocialId?: string;
}

// DTO para respuesta paginada
export class PaginatedPacienteTieneInformeResponseDto {
  data: PacienteTieneInformeResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(partial: Partial<PaginatedPacienteTieneInformeResponseDto>) {
    Object.assign(this, partial);
  }
}

// DTO para estadísticas de relaciones paciente-informe
export class PacienteTieneInformeStatsDto {
  totalRelaciones: number;
  pacientesConInformes: number;
  informesAsignados: number;
  promedioPorPaciente: number;
  porPsicologo: { psicologoId: string; nombrePsicologo: string; totalInformes: number }[];
  porObraSocial: { obraSocialId: string; nombreObraSocial: string; totalInformes: number }[];

  constructor(partial: Partial<PacienteTieneInformeStatsDto>) {
    Object.assign(this, partial);
  }
}

// DTO para eliminar relación (usando claves compuestas)
export class DeletePacienteTieneInformeDto {
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  pacienteId: string;

  @IsUUID('4', { message: 'El ID del informe debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del informe es requerido' })
  informeId: string;
}