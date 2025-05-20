import { NextResponse } from "next/server"
import { AppDataSource } from "@/lib/database"


export async function initializeDatabase() {
  try {
    // Inicializa la conexión
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Base de datos conectada y sincronizada correctamente");
    }
    return true;
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    return false;
  }
}