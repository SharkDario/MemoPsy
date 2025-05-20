// obra-social.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Paciente } from "./paciente.entity";

@Entity({ name: "obra_social" })
export class ObraSocial extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "activo", type: "tinyint" })
  activo: boolean;

  @OneToMany(() => Paciente, paciente => paciente.obraSocial)
  pacientes: Paciente[];
}