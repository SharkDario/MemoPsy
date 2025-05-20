import { NextResponse } from "next/server"
import { AppDataSource, initializeDatabase } from "@/lib/database"

export async function GET() {
  try {
    await initializeDatabase()

    // Verificar si la conexión está inicializada
    const isConnected = AppDataSource.isInitialized

    // Obtener información de la conexión
    const connectionDetails = {
      isConnected,
      type: AppDataSource.options.type,
      host: AppDataSource.options.host,
      port: AppDataSource.options.port,
      database: AppDataSource.options.database,
      synchronize: AppDataSource.options.synchronize,
      entities: AppDataSource.options.entities?.length || 0,
    }

    return NextResponse.json({
      message: "Prueba de conexión a la base de datos",
      connection: connectionDetails,
    })
  } catch (error) {
    console.error("Error de conexión:", error)
    return NextResponse.json(
      {
        error: "Error de conexión a la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

