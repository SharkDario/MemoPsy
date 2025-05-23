// paciente-tiene-informe.entity.ts
import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { InformeEntity } from "./informe.entity";
import { PacienteEntity } from "./paciente.entity";

@Entity({ name: "paciente_tiene_informe" })
export class PacienteTieneInformeEntity {
  @PrimaryColumn({ name: "informe_id" })
  informeId: string;

  @PrimaryColumn({ name: "paciente_id" })
  pacienteId: string;

  @ManyToOne(() => InformeEntity)
  @JoinColumn({ name: "informe_id" })
  informe: InformeEntity;

  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: "paciente_id" })
  paciente: PacienteEntity;
}