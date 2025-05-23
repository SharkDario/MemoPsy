// accion.entity.ts
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "accion" })
export class AccionEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;
}