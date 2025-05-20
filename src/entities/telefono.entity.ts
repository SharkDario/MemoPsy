// telefono.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Persona } from "./persona.entity";

@Entity({ name: "telefono" })
export class Telefono extends BaseEntity {
  @Column({ name: "persona_id" })
  personaId: string;

  @Column({ name: "numero" })
  numero: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;
}