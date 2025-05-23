// informe.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PsicologoEntity } from "./psicologo.entity";
import { PacienteTieneInformeEntity } from "./paciente-tiene-informe.entity";

@Entity({ name: "informe" })
export class InformeEntity extends BaseEntity {
  //@Column({ name: "psicologo_id" })
  //psicologoId: string;

  @Column({ name: "titulo" })
  titulo: string;

  @Column({ name: "contenido", type: "text" })
  contenido: string;

  @Column({ name: "fecha_creacion", type: "datetime" })
  fechaCreacion: Date;

  @Column({ name: "es_privado", type: "tinyint" })
  esPrivado: boolean;

  @ManyToOne(() => PsicologoEntity)
  @JoinColumn({ name: "psicologo_id" })
  psicologo: PsicologoEntity;

  /*
  @OneToMany(() => PacienteTieneInformeEntity, pacienteTieneInforme => pacienteTieneInforme.informe)
  pacienteTieneInforme: PacienteTieneInformeEntity[];
  */
}