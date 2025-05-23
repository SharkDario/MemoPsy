// paciente-tiene-sesion.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { SesionEntity } from "./sesion.entity";
import { PacienteEntity } from "./paciente.entity";

@Entity({ name: "paciente_tiene_sesion" })
export class PacienteTieneSesionEntity {
  @PrimaryColumn({ name: "sesion_id" })
  sesionId: string;
  
  @PrimaryColumn({ name: "paciente_id" })
  pacienteId: string;

  @ManyToOne(() => SesionEntity)
  @JoinColumn({ name: "sesion_id" })
  sesion: SesionEntity;

  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: "paciente_id" })
  paciente: PacienteEntity;
}