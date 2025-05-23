// obra-social.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "obra_social" })
export class ObraSocialEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "activo", type: "tinyint" })
  activo: boolean;
}