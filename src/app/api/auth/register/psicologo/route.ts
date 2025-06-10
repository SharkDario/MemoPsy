// app/api/register/psicologo/route.ts
import { NextResponse } from 'next/server';
import { UsuarioEntity, PersonaEntity, PsicologoEntity, PerfilEntity } from '@/entities/';
// import { Perfil } from '@/lib/entities/Perfil';
import { initializeDatabase } from '@/lib/database';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Asume que recibes todos los datos necesarios
    const { email, password, nombre, apellido, dni, fechaNacimiento, especialidad, numeroLicencia } = body;

    if (!email || !password || !nombre || !apellido || !dni || !especialidad || !fechaNacimiento || !numeroLicencia ) { // Ajusta requeridos
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = await initializeDatabase();
    let psicologoGuardado: PsicologoEntity | null = null;

    await db.transaction(async (manager: any) => {
        // 1. Crear Persona (igual que antes)
        const nuevaPersona = new PersonaEntity();
        nuevaPersona.nombre = nombre;
        nuevaPersona.apellido = apellido;
        nuevaPersona.dni = dni;
        nuevaPersona.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;

        const personaGuardada = await manager.save(nuevaPersona);

        // 2. Buscar Perfil "Psicologo" - ¡Placeholder!
        const perfilPsicologo = await manager.findOne(PerfilEntity, { where: { nombre: 'Perfil Psicólogo' } });
        if (!perfilPsicologo) throw new Error("Perfil 'Psicologo' no encontrado");

        // 3. Crear Usuario (igual que antes, pero con perfilPsicologo.id)
        const usuario = new UsuarioEntity();
        usuario.email = email;
        usuario.password = hashedPassword;
        usuario.personaId = personaGuardada.id;
        usuario.perfilId = perfilPsicologo.id;
        // ...otros campos usuario...
        const usuarioGuardado = await manager.save(usuario);

        // 4. Crear Psicologo
        const psicologo = new PsicologoEntity();
        psicologo.usuarioId = usuarioGuardado.id;
        psicologo.especialidad = especialidad || null;
        psicologo.numeroLicencia = numeroLicencia || null;
        psicologoGuardado = await manager.save(psicologo);

        console.log("Psicóloga/o guardado (mock):", psicologoGuardado);
    });

    if (psicologoGuardado) {
       return NextResponse.json({ message: 'Psicóloga/o registrado exitosamente', psicologo: psicologoGuardado }, { status: 201 });
    } else {
       throw new Error("La transacción finalizó pero no se obtuvo el psicólogo.");
    }

  } catch (error: any) {
    console.error("Error en API /api/register/psicologo:", error);
    if (error.code === 'ER_DUP_ENTRY' || error.message.includes('duplicate key')) {
        return NextResponse.json({ message: 'El email ya está registrado' }, { status: 409 });
    }
     if (error.message.includes("Perfil 'Psicologo' no encontrado")) {
        return NextResponse.json({ message: 'Error de configuración: Perfil Psicologo no existe.' }, { status: 500 });
     }
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}