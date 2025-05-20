// modalidad.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Sesion } from "./sesion.entity";

@Entity({ name: "modalidad" })
export class Modalidad extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @OneToMany(() => Sesion, sesion => sesion.modalidad)
  sesiones: Sesion[];
}