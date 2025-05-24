// create-perfil-tiene-permiso.dto.ts
// perfil-tiene-permiso-query.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
// perfil-tiene-permiso-response.dto.ts
import { PerfilResponseDto } from './perfil.dto';
import { PermisoResponseDto } from './permiso.dto';

export class CreatePerfilTienePermisoDto {
  @IsNotEmpty({ message: 'El ID del perfil es requerido' })
  @IsString({ message: 'El ID del perfil debe ser una cadena de texto' })
  perfilId: string;

  @IsNotEmpty({ message: 'El ID del permiso es requerido' })
  @IsString({ message: 'El ID del permiso debe ser una cadena de texto' })
  permisoId: string;
}

export class PerfilTienePermisoResponseDto {
  perfilId: string;
  permisoId: string;
  perfil: PerfilResponseDto;
  permiso: PermisoResponseDto;

  constructor(data: {
    perfilId: string;
    permisoId: string;
    perfil: PerfilResponseDto;
    permiso: PermisoResponseDto;
  }) {
    this.perfilId = data.perfilId;
    this.permisoId = data.permisoId;
    this.perfil = data.perfil;
    this.permiso = data.permiso;
  }
}

export class PerfilTienePermisoQueryDto {
  @IsOptional()
  @IsString({ message: 'El ID del perfil debe ser una cadena de texto' })
  perfilId?: string;

  @IsOptional()
  @IsString({ message: 'El ID del permiso debe ser una cadena de texto' })
  permisoId?: string;
}