// domicilio.entity.ts
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity";
import { PersonaEntity } from "./persona.entity";
import { CiudadEntity } from "./ciudad.entity";

@Entity({ name: "domicilio" })
export class DomicilioEntity extends BaseEntity {
  //@Column({ name: "persona_id" })
  //personaId: string;

  @Column({ name: "numero" })
  numero: string;

  @Column({ name: "codigo_postal" })
  codigoPostal: string;

  @Column({ name: "calle" })
  calle: string;

  //@Column({ name: "ciudad_id" })
  //ciudadId: string;

  @ManyToOne(() => PersonaEntity)
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;

  @ManyToOne(() => CiudadEntity)
  @JoinColumn({ name: "ciudad_id" })
  ciudad: CiudadEntity;
}