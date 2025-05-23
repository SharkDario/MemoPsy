// tipo-factura.entity.ts
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "tipo_factura" })
export class TipoFacturaEntity extends BaseEntity {
  @Column({ name: "descripcion" })
  descripcion: string;
}