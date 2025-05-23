// permiso.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { ModuloEntity } from "./modulo.entity";
import { AccionEntity } from "./accion.entity";

@Entity({ name: "permiso" })
export class PermisoEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "descripcion" })
  descripcion: string;

  @ManyToOne(() => ModuloEntity)
  @JoinColumn({ name: "modulo_id" })
  modulo: ModuloEntity;

  @ManyToOne(() => AccionEntity)
  @JoinColumn({ name: "accion_id" })
  accion: AccionEntity;
}