// perfil-tiene-permiso.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Perfil } from "./perfil.entity";
import { Permiso } from "./permiso.entity";

@Entity({ name: "perfil_tiene_permiso" })
export class PerfilTienePermiso extends BaseEntity {
  @Column({ name: "perfil_id" })
  perfilId: string;

  @Column({ name: "permiso_id" })
  permisoId: string;

  @ManyToOne(() => Perfil)
  @JoinColumn({ name: "perfil_id" })
  perfil: Perfil;

  @ManyToOne(() => Permiso)
  @JoinColumn({ name: "permiso_id" })
  permiso: Permiso;
}