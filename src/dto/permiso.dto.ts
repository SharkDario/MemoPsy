// create-permiso.dto.ts
// update-permiso.dto.ts
import { IsNotEmpty, IsString, Length, IsUUID, IsOptional } from 'class-validator';

export class CreatePermisoDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(1, 500, { message: 'La descripción debe tener entre 1 y 500 caracteres' })
  descripcion: string;

  @IsNotEmpty({ message: 'El ID del módulo es requerido' })
  @IsUUID('4', { message: 'El ID del módulo debe ser un UUID válido' })
  moduloId: string;

  @IsNotEmpty({ message: 'El ID de la acción es requerido' })
  @IsUUID('4', { message: 'El ID de la acción debe ser un UUID válido' })
  accionId: string;
}

export class UpdatePermisoDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(1, 500, { message: 'La descripción debe tener entre 1 y 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del módulo debe ser un UUID válido' })
  moduloId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de la acción debe ser un UUID válido' })
  accionId?: string;
}

// permiso-response.dto.ts
export class PermisoResponseDto {
  id: string;
  nombre: string;
  descripcion: string;
  modulo: {
    id: string;
    nombre: string;
  };
  accion: {
    id: string;
    nombre: string;
  };

  constructor(data: {
    id: string;
    nombre: string;
    descripcion: string;
    modulo: {
      id: string;
      nombre: string;
    };
    accion: {
      id: string;
      nombre: string;
    };
  }) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.modulo = data.modulo;
    this.accion = data.accion;
  }
}