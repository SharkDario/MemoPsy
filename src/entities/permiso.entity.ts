// permiso.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Modulo } from "./modulo.entity";
import { Accion } from "./accion.entity";
import { PerfilTienePermiso } from "./perfil-tiene-permiso.entity";

@Entity({ name: "permiso" })
export class Permiso extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "descripcion" })
  descripcion: string;

  @Column({ name: "modulo_id" })
  moduloId: string;

  @Column({ name: "accion_id" })
  accionId: string;

  @ManyToOne(() => Modulo)
  @JoinColumn({ name: "modulo_id" })
  modulo: Modulo;

  @ManyToOne(() => Accion)
  @JoinColumn({ name: "accion_id" })
  accion: Accion;

  @OneToMany(() => PerfilTienePermiso, perfilTienePermiso => perfilTienePermiso.permiso)
  perfiles: PerfilTienePermiso[];
}