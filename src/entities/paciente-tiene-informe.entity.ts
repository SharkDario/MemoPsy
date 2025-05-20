// paciente-tiene-informe.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Informe } from "./informe.entity";
import { Paciente } from "./paciente.entity";

@Entity({ name: "paciente_tiene_informe" })
export class PacienteTieneInforme extends BaseEntity {
  @Column({ name: "informe_id" })
  informeId: string;

  @Column({ name: "paciente_id" })
  pacienteId: string;

  @ManyToOne(() => Informe)
  @JoinColumn({ name: "informe_id" })
  informe: Informe;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: "paciente_id" })
  paciente: Paciente;
}