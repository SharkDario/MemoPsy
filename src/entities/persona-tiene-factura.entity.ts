// persona-tiene-factura.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { PersonaEntity } from "./persona.entity";
import { FacturaEntity } from "./factura.entity";

@Entity({ name: "persona_tiene_factura" })
export class PersonaTieneFacturaEntity {
  @PrimaryColumn({ name: "persona_id" })
  personaId: string;
     
  @PrimaryColumn({ name: "factura_id" })
  facturaId: string;

  @ManyToOne(() => PersonaEntity)
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;

  @ManyToOne(() => FacturaEntity)
  @JoinColumn({ name: "factura_id" })
  factura: FacturaEntity;
}