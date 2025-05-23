// estado.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "estado" })
export class EstadoEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;
}