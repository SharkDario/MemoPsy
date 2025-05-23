// perfil.entity.ts
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity";

@Entity({ name: "perfil" })
export class PerfilEntity extends BaseEntity {
  @Column({ name: "nombre" })
  nombre: string;

  @Column({ name: "descripcion" })
  descripcion: string;

  /*
  @OneToMany(() => UsuarioTienePerfilEntity, usuarioTienePerfil => usuarioTienePerfil.perfil)
  usuarios: UsuarioTienePerfilEntity[];

  @OneToMany(() => PerfilTienePermisoEntity, perfilTienePermiso => perfilTienePermiso.perfil)
  permisos: PerfilTienePermisoEntity[];
  */
}