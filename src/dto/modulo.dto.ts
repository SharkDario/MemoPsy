// create-modulo.dto.ts
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';
// update-modulo.dto.ts

export class CreateModuloDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;
}

export class UpdateModuloDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;
}

// modulo-response.dto.ts
export class ModuloResponseDto {
  id: string;
  nombre: string;

  constructor(data: {
    id: string;
    nombre: string;
  }) {
    this.id = data.id;
    this.nombre = data.nombre;
  }
}