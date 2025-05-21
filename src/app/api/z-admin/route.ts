
import { NextResponse } from "next/server";
import { AppDataSource } from '@/lib/database';
import { Usuario, Persona } from "@/entities";
import * as bcrypt from "bcrypt";

export async function GET() {
  try {
    // Inicializar la conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Crear persona para el administrador
    const adminPersona = new Persona();
    adminPersona.nombre = "Dario";
    adminPersona.apellido = "Coronel";
    adminPersona.dni = "10000000";
    adminPersona.fechaNacimiento = new Date("1998-08-07");

    await AppDataSource.manager.save(adminPersona);
    console.log("Persona para admin creada con ID:", adminPersona.id);

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash("admin123", 10); // Cambia "admin123" por una contraseña segura

    // Crear usuario administrador
    const adminUser = new Usuario();
    adminUser.email = "admin@memopsy.com"; // Cambia por el email que prefieras
    adminUser.password = hashedPassword;
    adminUser.activo = true;
    adminUser.personaId = adminPersona.id;
    adminUser.ultimoAcceso = new Date();

    await AppDataSource.manager.save(adminUser);
    console.log("Usuario administrador creado con ID:", adminUser.id);

    console.log("¡Usuario administrador creado exitosamente!");
    return NextResponse.json({ 
      success: true,
      message: "Usuario administrador creado exitosamente"
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error al crear el usuario" 
    }, { status: 500 });
  }
}