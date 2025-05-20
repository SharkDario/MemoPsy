// persona-tiene-factura.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Persona } from "./persona.entity";
import { Factura } from "./factura.entity";

@Entity({ name: "persona_tiene_factura" })
export class PersonaTieneFactura extends BaseEntity {
  @Column({ name: "persona_id" })
  personaId: string;

  @Column({ name: "factura_id" })
  facturaId: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @ManyToOne(() => Factura)
  @JoinColumn({ name: "factura_id" })
  factura: Factura;
}