// psicologo.entity.ts
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import type { PersonaEntity } from "./persona.entity";

@Entity({ name: "psicologo" })
export class PsicologoEntity extends BaseEntity {
  //@Column({ name: "persona_id" })
  //personaId: string;

  @Column({ name: "especialidad" })
  especialidad: string;

  @Column({ name: "numero_licencia" })
  numeroLicencia: string;

  @OneToOne("PersonaEntity")
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;

  /*
  @OneToMany(() => InformeEntity, informe => informe.psicologo)
  informes: InformeEntity[];

  @OneToMany(() => SesionEntity, sesion => sesion.psicologo)
  sesiones: SesionEntity[];
  */
}