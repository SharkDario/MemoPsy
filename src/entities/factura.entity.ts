// factura.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { TipoFacturaEntity } from "./tipo-factura.entity";
import { MedioDePagoEntity } from "./medio-de-pago.entity";

@Entity({ name: "factura" })
export class FacturaEntity extends BaseEntity {
  @Column({ name: "numero" })
  numero: string;

  @Column({ name: "fecha_emision", type: "date" })
  fechaEmision: Date;

  //@Column({ name: "tipo_factura_id" })
  //tipoFacturaId: string;

  //@Column({ name: "medio_de_pago_id" })
  //medioDePagoId: string;

  @ManyToOne(() => TipoFacturaEntity)
  @JoinColumn({ name: "tipo_factura_id" })
  tipoFactura: TipoFacturaEntity;

  @ManyToOne(() => MedioDePagoEntity)
  @JoinColumn({ name: "medio_de_pago_id" })
  medioDePago: MedioDePagoEntity;

  /*
  @OneToMany(() => DetalleFacturaEntity, detalleFactura => detalleFactura.factura)
  detalles: DetalleFacturaEntity[];

  @OneToMany(() => PersonaTieneFacturaEntity, personaTieneFactura => personaTieneFactura.factura)
  personas: PersonaTieneFacturaEntity[];
  */
}