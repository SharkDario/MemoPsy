// dto/modalidad.dto.ts
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class CreateModalidadDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;
}

export class UpdateModalidadDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
    nombre: string;
}

export class ModalidadResponseDto {
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