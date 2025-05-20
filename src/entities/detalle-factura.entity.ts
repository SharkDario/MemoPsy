// detalle-factura.entity
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Sesion } from "./sesion.entity";
import { Factura } from "./factura.entity";

@Entity({ name: "detalle_factura" })
export class DetalleFactura extends BaseEntity {
  @Column({ name: "precio", type: "decimal", precision: 10, scale: 2 })
  precio: number;

  @Column({ name: "sesion_id" })
  sesionId: string;

  @Column({ name: "factura_id" })
  facturaId: string;

  @ManyToOne(() => Sesion)
  @JoinColumn({ name: "sesion_id" })
  sesion: Sesion;

  @ManyToOne(() => Factura)
  @JoinColumn({ name: "factura_id" })
  factura: Factura;
}