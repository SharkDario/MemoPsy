// sesion.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PsicologoEntity } from "./psicologo.entity";
import { ModalidadEntity } from "./modalidad.entity";
import { EstadoEntity } from "./estado.entity";

@Entity({ name: "sesion" })
export class SesionEntity extends BaseEntity {
  @Column({ name: "fecha_hora_inicio", type: "datetime" })
  fechaHoraInicio: Date;

  @Column({ name: "fecha_hora_fin", type: "datetime" })
  fechaHoraFin: Date;

  @ManyToOne(() => PsicologoEntity)
  @JoinColumn({ name: "psicologo_id" })
  psicologo: PsicologoEntity;

  @ManyToOne(() => ModalidadEntity)
  @JoinColumn({ name: "modalidad_id" })
  modalidad: ModalidadEntity;

  @ManyToOne(() => EstadoEntity)
  @JoinColumn({ name: "estado_id" })
  estado: EstadoEntity;
}