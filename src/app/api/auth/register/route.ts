// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { Usuario, Persona } from '@/entities/';
// import { Perfil } from '@/lib/entities/Perfil'; // Si necesitas buscar el perfil
// import { getDbConnection } from "@/lib/database";
import { initializeDatabase } from '@/lib/database';
import bcrypt from 'bcrypt';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellido, dni, fechaNacimiento, esAdmin } = body;

    // Validación básica 
    if (!email || !password || !nombre || !apellido || !dni || !fechaNacimiento) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hashear contraseña
    const db = await initializeDatabase();

    let nuevoUsuario: Usuario | null = null;

    // Usar transacción para asegurar atomicidad
    await db.transaction(async (manager: any) => { // 'manager' sería tu EntityManager de TypeORM
        // 1. Crear Persona
        const nuevaPersona = new Persona();
        nuevaPersona.nombre = nombre;
        nuevaPersona.apellido = apellido;
        nuevaPersona.dni = dni || null; // Manejar opcionales
        nuevaPersona.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
        const personaGuardada = await manager.save(nuevaPersona);
        console.log("Persona guardada (mock):", personaGuardada);

        // 2. Buscar Perfil por defecto (ej. 'Paciente' o uno genérico) - ¡Placeholder!
        // const perfilRepo = manager.getRepository(Perfil);
        //const perfilPorDefecto = await manager.findOne(/*Perfil,*/ { where: { nombre: 'Paciente' } }); // O el perfil que aplique
        //if (!perfilPorDefecto) {
        //     throw new Error("Perfil por defecto no encontrado"); // ¡Manejar esto mejor!
        //}
        //console.log("Perfil encontrado (mock):", perfilPorDefecto);

        // 3. Crear Usuario
        const usuario = new Usuario();
        usuario.email = email;
        usuario.password = hashedPassword;
        usuario.personaId = personaGuardada.id; // Usar el ID de la persona guardada
        //usuario.perfilId = perfilPorDefecto.id; // Usar el ID del perfil encontrado
        usuario.activo = true; // O false si requiere activación
        usuario.esAdmin = esAdmin;

        nuevoUsuario = await manager.save(usuario);

        console.log("Usuario guardado (mock):", nuevoUsuario);
    });

    // Excluir password de la respuesta
    if (nuevoUsuario) {
       const { password, ...usuarioSinPassword } = nuevoUsuario;
       return NextResponse.json({ message: 'Usuario registrado exitosamente', user: usuarioSinPassword }, { status: 201 });
    } else {
        // Esto no debería ocurrir si la transacción no lanzó error, pero por si acaso
        throw new Error("La transacción finalizó pero no se obtuvo el usuario.");
    }

  } catch (error: any) {
    console.error("Error en API /api/auth/register:", error);
    // Manejar errores específicos (ej. email duplicado - depende de tu DB/ORM)
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('duplicate key')) { // Ejemplo MySQL/PostgreSQL
        return NextResponse.json({ message: 'El email ya está registrado' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}