// persona.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Domicilio } from "./domicilio.entity";
import { Telefono } from "./telefono.entity";
import { Usuario } from "./usuario.entity";
import { PersonaTieneFactura } from "./persona-tiene-factura.entity";
import { Paciente } from "./paciente.entity";

@Entity({ name: "persona" })
export class Persona extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "apellido" })
  apellido: string;

  @Column({ name: "dni" })
  dni: string;

  @Column({ name: "fecha_nacimiento", type: "date" })
  fechaNacimiento: Date;

  @OneToMany(() => Domicilio, domicilio => domicilio.persona)
  domicilios: Domicilio[];

  @OneToMany(() => Telefono, telefono => telefono.persona)
  telefonos: Telefono[];

  @OneToMany(() => Usuario, usuario => usuario.persona)
  usuarios: Usuario[];

  @OneToMany(() => PersonaTieneFactura, personaTieneFactura => personaTieneFactura.persona)
  facturas: PersonaTieneFactura[];

  @OneToMany(() => Paciente, paciente => paciente.persona)
  pacientes: Paciente[];
}