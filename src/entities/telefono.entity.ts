// telefono.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PersonaEntity } from "./persona.entity";

@Entity({ name: "telefono" })
export class TelefonoEntity extends BaseEntity {
  @Column({ name: "numero" })
  numero: string;

  @ManyToOne(() => PersonaEntity)
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;
}