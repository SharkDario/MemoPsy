// usuario.entity.ts
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { Persona } from "./persona.entity";
import { UsuarioTienePerfil } from "./usuario-tiene-perfil.entity";

@Entity({ name: "usuario" })
export class Usuario extends BaseEntity {
  @Column({ name: "persona_id" })
  personaId: string;

  @Column({ name: "email" })
  email: string;

  @Column({ name: "password" })
  password: string;

  @Column({ name: "activo", type: "tinyint" })
  activo: boolean;

  @Column({ name: "ultimo_acceso", type: "datetime" })
  ultimoAcceso: Date;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona: Persona;

  @OneToMany(() => UsuarioTienePerfil, usuarioTienePerfil => usuarioTienePerfil.usuario)
  perfiles: UsuarioTienePerfil[];
}