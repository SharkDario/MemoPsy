// usuario-tiene-perfil.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { UsuarioEntity } from "./usuario.entity";
import { PerfilEntity } from "./perfil.entity";

@Entity({ name: "usuario_tiene_perfil" })
export class UsuarioTienePerfilEntity {
  @PrimaryColumn({ name: "usuario_id" })
  usuarioId: string;

  @PrimaryColumn({ name: "perfil_id" })
  perfilId: string;

  @ManyToOne(() => UsuarioEntity)
  @JoinColumn({ name: "usuario_id" })
  usuario: UsuarioEntity;

  @ManyToOne(() => PerfilEntity)
  @JoinColumn({ name: "perfil_id" })
  perfil: PerfilEntity;
}