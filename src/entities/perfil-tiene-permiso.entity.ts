// perfil-tiene-permiso.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { PerfilEntity } from "./perfil.entity";
import { PermisoEntity } from "./permiso.entity";

@Entity({ name: "perfil_tiene_permiso" })
export class PerfilTienePermisoEntity {
  @PrimaryColumn({ name: "perfil_id" })
  perfilId: string;
    
  @PrimaryColumn({ name: "permiso_id" })
  permisoId: string;

  @ManyToOne(() => PerfilEntity)
  @JoinColumn({ name: "perfil_id" })
  perfil: PerfilEntity;

  @ManyToOne(() => PermisoEntity)
  @JoinColumn({ name: "permiso_id" })
  permiso: PermisoEntity;
}