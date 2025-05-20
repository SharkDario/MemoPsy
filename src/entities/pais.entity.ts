// pais.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Ciudad } from "./ciudad.entity";

@Entity({ name: "pais" })
export class Pais extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @OneToMany(() => Ciudad, ciudad => ciudad.pais)
  ciudades: Ciudad[];
}