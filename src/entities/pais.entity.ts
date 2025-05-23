// pais.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "pais" })
export class PaisEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;
}