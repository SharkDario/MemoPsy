// persona.entity.ts
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "persona" })
export class PersonaEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "apellido" })
  apellido: string;

  @Column({ name: "dni" })
  dni: string;

  @Column({ name: "fecha_nacimiento", type: "date" })
  fechaNacimiento: Date;
}