// usuario-tiene-perfil.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Usuario } from "./usuario.entity";
import { Perfil } from "./perfil.entity";

@Entity({ name: "usuario_tiene_perfil" })
export class UsuarioTienePerfil extends BaseEntity {
  @Column({ name: "usuario_id" })
  usuarioId: string;

  @Column({ name: "perfil_id" })
  perfilId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;

  @ManyToOne(() => Perfil)
  @JoinColumn({ name: "perfil_id" })
  perfil: Perfil;
}