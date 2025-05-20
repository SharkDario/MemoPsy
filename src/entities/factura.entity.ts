// factura.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { TipoFactura } from "./tipo-factura.entity";
import { MedioDePago } from "./medio-de-pago.entity";
import { DetalleFactura } from "./detalle-factura.entity";
import { PersonaTieneFactura } from "./persona-tiene-factura.entity";

@Entity({ name: "factura" })
export class Factura extends BaseEntity {
  @Column({ name: "numero" })
  numero: string;

  @Column({ name: "fecha_emision", type: "date" })
  fechaEmision: Date;

  @Column({ name: "tipo_factura_id" })
  tipoFacturaId: string;

  @Column({ name: "medio_de_pago_id" })
  medioDePagoId: string;

  @ManyToOne(() => TipoFactura)
  @JoinColumn({ name: "tipo_factura_id" })
  tipoFactura: TipoFactura;

  @ManyToOne(() => MedioDePago)
  @JoinColumn({ name: "medio_de_pago_id" })
  medioDePago: MedioDePago;

  @OneToMany(() => DetalleFactura, detalleFactura => detalleFactura.factura)
  detalles: DetalleFactura[];

  @OneToMany(() => PersonaTieneFactura, personaTieneFactura => personaTieneFactura.factura)
  personas: PersonaTieneFactura[];
}