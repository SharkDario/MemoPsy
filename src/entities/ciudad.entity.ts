// ciudad.entity.ts
import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Pais } from "./pais.entity";
import { Domicilio } from "./domicilio.entity";

@Entity({ name: "ciudad" })
export class Ciudad extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "pais_id" })
  paisId: string;

  @ManyToOne(() => Pais)
  @JoinColumn({ name: "pais_id" })
  pais: Pais;

  @OneToMany(() => Domicilio, domicilio => domicilio.ciudad)
  domicilios: Domicilio[];
}