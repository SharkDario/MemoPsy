// paciente-tiene-sesion.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Sesion } from "./sesion.entity";
import { Paciente } from "./paciente.entity";

@Entity({ name: "paciente_tiene_sesion" })
export class PacienteTieneSesion extends BaseEntity {
  @Column({ name: "sesion_id" })
  sesionId: string;

  @Column({ name: "paciente_id" })
  pacienteId: string;

  @ManyToOne(() => Sesion)
  @JoinColumn({ name: "sesion_id" })
  sesion: Sesion;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: "paciente_id" })
  paciente: Paciente;
}