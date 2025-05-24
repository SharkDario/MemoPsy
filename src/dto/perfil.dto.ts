// create-perfil.dto.ts
// update-perfil.dto.ts
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class CreatePerfilDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(1, 500, { message: 'La descripción debe tener entre 1 y 500 caracteres' })
  descripcion: string;
}

export class UpdatePerfilDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(1, 500, { message: 'La descripción debe tener entre 1 y 500 caracteres' })
  descripcion?: string;
}

// perfil-response.dto.ts
export class PerfilResponseDto {
  id: string;
  nombre: string;
  descripcion: string;

  constructor(data: {
    id: string;
    nombre: string;
    descripcion: string;
  }) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
  }
}