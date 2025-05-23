// paciente.entity.ts
import { Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base-entity";
import type { PersonaEntity } from "./persona.entity";
import { ObraSocialEntity } from "./obra-social.entity";

@Entity({ name: "paciente" })
export class PacienteEntity extends BaseEntity {
  @OneToOne("PersonaEntity")
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;

  @ManyToOne(() => ObraSocialEntity)
  @JoinColumn({ name: "obra_social_id" })
  obraSocial: ObraSocialEntity;

  /*
  @OneToMany(() => PacienteTieneInformeEntity, pacienteTieneInforme => pacienteTieneInforme.paciente)
  informes: PacienteTieneInformeEntity[];

  @OneToMany(() => PacienteTieneSesionEntity, pacienteTieneSesion => pacienteTieneSesion.paciente)
  sesiones: PacienteTieneSesionEntity[];
  */
}

//@Column({ name: "persona_id" })
  //personaId: string;

  //@Column({ name: "obra_social_id" })
  //obraSocialId: string;