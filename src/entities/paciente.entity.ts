// paciente.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Persona } from "./persona.entity";
import { ObraSocial } from "./obra-social.entity";
import { PacienteTieneInforme } from "./paciente-tiene-informe.entity";
import { PacienteTieneSesion } from "./paciente-tiene-sesion.entity";

@Entity({ name: "paciente" })
export class Paciente extends BaseEntity {
  @Column({ name: "persona_id" })
  personaId: string;

  @Column({ name: "obra_social_id" })
  obraSocialId: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @ManyToOne(() => ObraSocial)
  @JoinColumn({ name: "obra_social_id" })
  obraSocial: ObraSocial;

  @OneToMany(() => PacienteTieneInforme, pacienteTieneInforme => pacienteTieneInforme.paciente)
  informes: PacienteTieneInforme[];

  @OneToMany(() => PacienteTieneSesion, pacienteTieneSesion => pacienteTieneSesion.paciente)
  sesiones: PacienteTieneSesion[];
}