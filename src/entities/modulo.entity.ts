// modulo.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Permiso } from "./permiso.entity";

@Entity({ name: "modulo" })
export class Modulo extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @OneToMany(() => Permiso, permiso => permiso.modulo)
  permisos: Permiso[];
}
