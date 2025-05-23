// medio-de-pago.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "medio_de_pago" })
export class MedioDePagoEntity extends BaseEntity {
  @Column({ name: "descripcion" })
  descripcion: string;
}