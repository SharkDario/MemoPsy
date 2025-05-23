// modulo.entity.ts
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "modulo" })
export class ModuloEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;
}
