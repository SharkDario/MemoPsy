// medio-de-pago.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Factura } from "./factura.entity";

@Entity({ name: "medio_de_pago" })
export class MedioDePago extends BaseEntity {
  @Column({ name: "descripcion" })
  descripcion: string;

  @OneToMany(() => Factura, factura => factura.medioDePago)
  facturas: Factura[];
}