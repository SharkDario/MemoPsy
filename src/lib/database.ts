// lib/database.ts
import "reflect-metadata"
import { DataSource } from "typeorm"
import {
  BaseEntity,
  Persona,
  Permiso,
  Perfil,
  Usuario,
  Psicologo,
  Paciente,
  Sesion,
  Informe,
  PerfilTienePermiso,
} from "../entities"

// Configuración para la conexión a la base de datos
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "psicologia_db",
  synchronize: false,
  logging: true,
  //entities: [Persona, Permiso, Perfil, Usuario, Psicologo, Paciente, Recepcionista, Sesion, Informe, PerfilPermiso],
  entities: [
    BaseEntity,
    Persona,
    Permiso, 
    Perfil,
    PerfilTienePermiso,
    Usuario,
    Psicologo,
    Paciente,
    Sesion,
    Informe
  ],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
})

// Singleton para mantener la conexión
let initialized = false

export async function initializeDatabase() {
  if (!initialized) {
    try {
      if (!AppDataSource.isInitialized) {
        console.log("Intentando inicializar la conexión a la base de datos...")
        await AppDataSource.initialize()
        console.log("¡Data Source ha sido inicializado correctamente!")
      }
      initialized = true
    } catch (error) {
      console.error("Error durante la inicialización del Data Source", error)
      throw error
    }
  }
  return AppDataSource
}

// Función para obtener un repositorio
export async function getRepository(entity: any) {
  const dataSource = await initializeDatabase()
  return dataSource.getRepository(entity)
}

