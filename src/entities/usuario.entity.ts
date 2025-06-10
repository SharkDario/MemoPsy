// usuario.entity.ts
import { Column, Entity, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import type { PersonaEntity } from "./persona.entity";

@Entity({ name: "usuario" })
export class UsuarioEntity extends BaseEntity {
  @Column({ name: "email" })
  email: string;

  @Column({ name: "password" })
  password: string;

  @Column({ name: "activo", type: "tinyint" })
  activo: boolean;

  @Column({ name: "ultimo_acceso", type: "datetime" })
  ultimoAcceso: Date;

  @OneToOne("PersonaEntity")
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;

  @Column({ name: "auth0Id", unique: true, nullable: true})
  auth0Id: string;
}