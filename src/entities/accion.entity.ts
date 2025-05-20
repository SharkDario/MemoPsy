// accion.entity.ts
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Permiso } from "./permiso.entity";

@Entity({ name: "accion" })
export class Accion extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @OneToMany(() => Permiso, permiso => permiso.accion)
  permisos: Permiso[];
}