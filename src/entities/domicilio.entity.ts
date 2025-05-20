// domicilio.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Persona } from "./persona.entity";
import { Ciudad } from "./ciudad.entity";

@Entity({ name: "domicilio" })
export class Domicilio extends BaseEntity {
  @Column({ name: "persona_id" })
  personaId: string;

  @Column({ name: "numero" })
  numero: string;

  @Column({ name: "codigo_postal" })
  codigoPostal: string;

  @Column({ name: "calle" })
  calle: string;

  @Column({ name: "ciudad_id" })
  ciudadId: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @ManyToOne(() => Ciudad)
  @JoinColumn({ name: "ciudad_id" })
  ciudad: Ciudad;
}