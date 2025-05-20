// app/api/register/paciente/route.ts
import { NextResponse } from 'next/server';
import { Usuario, Persona, Paciente, Perfil } from '@/entities/';
// import { Perfil } from '@/lib/entities/Perfil';
import { initializeDatabase } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Asume que recibes todos los datos necesarios para Persona y Usuario
    const { email, password, nombre, apellido, dni, fechaNacimiento } = body;

    if (!email || !password || !nombre || !apellido || !dni || !fechaNacimiento) { // Ajusta requeridos
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = await initializeDatabase();
    let pacienteGuardado: Paciente | null = null;

    await db.transaction(async (manager: any) => {
        // 1. Crear Persona
        const nuevaPersona = new Persona();
        nuevaPersona.nombre = nombre;
        nuevaPersona.apellido = apellido;
        nuevaPersona.dni = dni;
        nuevaPersona.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
        // ...otros campos persona...
        const personaGuardada = await manager.save(nuevaPersona);

        // 2. Buscar Perfil "Paciente" - ¡Placeholder!
        const perfilPaciente = await manager.findOne(Perfil, { where: { nombre: 'Perfil Paciente' } });
        if (!perfilPaciente) throw new Error("Perfil 'Paciente' no encontrado");

        // 3. Crear Usuario
        const usuario = new Usuario();
        usuario.email = email;
        usuario.password = hashedPassword;
        usuario.personaId = personaGuardada.id;
        usuario.perfilId = perfilPaciente.id;
        usuario.activo = true; // Por defecto, el usuario está activo
        // ...otros campos usuario...
        const usuarioGuardado = await manager.save(usuario);

        // 4. Crear Paciente
        const paciente = new Paciente();
        paciente.usuarioId = usuarioGuardado.id;
        paciente.fechaRegistro = new Date(); // Fecha actual por defecto
        pacienteGuardado = await manager.save(paciente);

         console.log("Paciente guardado (mock):", pacienteGuardado);
    });

     if (pacienteGuardado) {
        return NextResponse.json({ message: 'Paciente registrado exitosamente', paciente: pacienteGuardado }, { status: 201 });
     } else {
        throw new Error("La transacción finalizó pero no se obtuvo el paciente.");
     }

  } catch (error: any) {
    console.error("Error en API /api/register/paciente:", error);
     if (error.code === 'ER_DUP_ENTRY' || error.message.includes('duplicate key')) {
        return NextResponse.json({ message: 'El email ya está registrado' }, { status: 409 });
    }
     if (error.message.includes("Perfil 'Paciente' no encontrado")) {
        return NextResponse.json({ message: 'Error de configuración: Perfil Paciente no existe.' }, { status: 500 });
     }
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}