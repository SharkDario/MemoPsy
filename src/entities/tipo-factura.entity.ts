// tipo-factura.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Factura } from "./factura.entity";

@Entity({ name: "tipo_factura" })
export class TipoFactura extends BaseEntity {
  @Column({ name: "descripcion" })
  descripcion: string;

  @OneToMany(() => Factura, factura => factura.tipoFactura)
  facturas: Factura[];
}