import { initializeDatabase } from "./database"

// Middleware para conectar a la base de datos
export async function dbConnect() {
  try {
    await initializeDatabase()
  } catch (error) {
    console.error("Failed to connect to the database:", error)
    throw new Error("Database connection failed")
  }
}

// Función para usar en API routes
export function withDatabase(handler: any) {
  return async (req: any, res: any) => {
    try {
      await dbConnect()
      return handler(req, res)
    } catch (error) {
      console.error("Database error:", error)
      return res.status(500).json({ error: "Database connection error" })
    }
  }
}

