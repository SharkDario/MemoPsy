// perfil.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";
import { UsuarioTienePerfil } from "./usuario-tiene-perfil.entity";
import { PerfilTienePermiso } from "./perfil-tiene-permiso.entity";

@Entity({ name: "perfil" })
export class Perfil extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "descripcion" })
  descripcion: string;

  @OneToMany(() => UsuarioTienePerfil, usuarioTienePerfil => usuarioTienePerfil.perfil)
  usuarios: UsuarioTienePerfil[];

  @OneToMany(() => PerfilTienePermiso, perfilTienePermiso => perfilTienePermiso.perfil)
  permisos: PerfilTienePermiso[];
}