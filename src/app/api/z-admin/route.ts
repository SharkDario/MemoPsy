//app/api/z-admin/route.ts
import { NextResponse } from "next/server";
import { AppDataSource } from '@/lib/database';
import { UsuarioEntity, PersonaEntity } from "@/entities";
import * as bcrypt from "bcrypt";

export async function GET() {
  try {
    // Inicializar la conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Crear persona para el administrador
    const adminPersona = new PersonaEntity();
    adminPersona.nombre = "Dario";
    adminPersona.apellido = "Coronel";
    adminPersona.dni = "10000000";
    adminPersona.fechaNacimiento = new Date("1998-08-07");

    await AppDataSource.manager.save(adminPersona);
    console.log("Persona para admin creada con ID:", adminPersona.id);

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash("Admin$07", 10); 

    // Crear usuario administrador
    const adminUser = new UsuarioEntity();
    adminUser.email = "mdarioc1998@gmail.com";
    adminUser.password = hashedPassword;
    adminUser.activo = true;
    adminUser.persona = adminPersona;
    adminUser.ultimoAcceso = new Date();
    //adminUser.auth0Id

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