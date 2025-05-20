// sesion.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Psicologo } from "./psicologo.entity";
import { Modalidad } from "./modalidad.entity";
import { Estado } from "./estado.entity";
import { PacienteTieneSesion } from "./paciente-tiene-sesion.entity";
import { DetalleFactura } from "./detalle-factura.entity";

@Entity({ name: "sesion" })
export class Sesion extends BaseEntity {
  @Column({ name: "psicologo_id" })
  psicologoId: string;

  @Column({ name: "fecha_hora_inicio", type: "datetime" })
  fechaHoraInicio: Date;

  @Column({ name: "fecha_hora_fin", type: "datetime" })
  fechaHoraFin: Date;

  @Column({ name: "modalidad_id" })
  modalidadId: string;

  @Column({ name: "estado_id" })
  estadoId: string;

  @ManyToOne(() => Psicologo)
  @JoinColumn({ name: "psicologo_id" })
  psicologo: Psicologo;

  @ManyToOne(() => Modalidad)
  @JoinColumn({ name: "modalidad_id" })
  modalidad: Modalidad;

  @ManyToOne(() => Estado)
  @JoinColumn({ name: "estado_id" })
  estado: Estado;

  @OneToMany(() => PacienteTieneSesion, pacienteTieneSesion => pacienteTieneSesion.sesion)
  pacientes: PacienteTieneSesion[];

  @OneToMany(() => DetalleFactura, detalleFactura => detalleFactura.sesion)
  detallesFactura: DetalleFactura[];
}