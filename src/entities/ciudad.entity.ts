// ciudad.entity.ts
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PaisEntity } from "./pais.entity";

@Entity({ name: "ciudad" })
export class CiudadEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  //@Column({ name: "pais_id" })
  //paisId: string;

  @ManyToOne(() => PaisEntity)
  @JoinColumn({ name: "pais_id" })
  pais: PaisEntity;

  //@OneToMany(() => DomicilioEntity, domicilio => domicilio.ciudad)
  //domicilios: DomicilioEntity[];
}