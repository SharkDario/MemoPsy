// psicologo.entity.ts
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Persona } from "./persona.entity";
import { Informe } from "./informe.entity";
import { Sesion } from "./sesion.entity";

@Entity({ name: "psicologo" })
export class Psicologo extends BaseEntity {
  @Column({ name: "persona_id" })
  personaId: string;

  @Column({ name: "especialidad" })
  especialidad: string;

  @Column({ name: "numero_licencia" })
  numeroLicencia: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @OneToMany(() => Informe, informe => informe.psicologo)
  informes: Informe[];

  @OneToMany(() => Sesion, sesion => sesion.psicologo)
  sesiones: Sesion[];
}