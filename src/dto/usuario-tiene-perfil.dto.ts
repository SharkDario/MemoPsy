// create-usuario-tiene-perfil.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
// usuario-tiene-perfil-query.dto.ts
// usuario-tiene-perfil-response.dto.ts
import { UsuarioResponseDto } from './usuario.dto';
import { PerfilResponseDto } from './perfil.dto';

export class CreateUsuarioTienePerfilDto {
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId: string;

  @IsNotEmpty({ message: 'El ID del perfil es requerido' })
  @IsString({ message: 'El ID del perfil debe ser una cadena de texto' })
  perfilId: string;
}

export class UsuarioTienePerfilResponseDto {
  usuarioId: string;
  perfilId: string;
  usuario: UsuarioResponseDto;
  perfil: PerfilResponseDto;

  constructor(data: {
    usuarioId: string;
    perfilId: string;
    usuario: UsuarioResponseDto;
    perfil: PerfilResponseDto;
  }) {
    this.usuarioId = data.usuarioId;
    this.perfilId = data.perfilId;
    this.usuario = data.usuario;
    this.perfil = data.perfil;
  }
}

export class UsuarioTienePerfilQueryDto {
  @IsOptional()
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId?: string;

  @IsOptional()
  @IsString({ message: 'El ID del perfil debe ser una cadena de texto' })
  perfilId?: string;
}