// detalle-factura.entity
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { SesionEntity } from "./sesion.entity";
import { FacturaEntity } from "./factura.entity";

@Entity({ name: "detalle_factura" })
export class DetalleFacturaEntity extends BaseEntity {
  @Column({ name: "precio", type: "decimal", precision: 10, scale: 2 })
  precio: number;

  //@Column({ name: "sesion_id" })
  //sesionId: string;

  //@Column({ name: "factura_id" })
  //facturaId: string;

  @ManyToOne(() => SesionEntity)
  @JoinColumn({ name: "sesion_id" })
  sesion: SesionEntity;

  @ManyToOne(() => FacturaEntity)
  @JoinColumn({ name: "factura_id" })
  factura: FacturaEntity;
}