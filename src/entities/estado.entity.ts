// estado.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Sesion } from "./sesion.entity";

@Entity({ name: "estado" })
export class Estado extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @OneToMany(() => Sesion, sesion => sesion.estado)
  sesiones: Sesion[];
}