// modalidad.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "modalidad" })
export class ModalidadEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;
}