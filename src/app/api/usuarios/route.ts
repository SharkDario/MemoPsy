// app/api/usuarios/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getRepository } from "@/lib/database"
import { PersonaEntity, UsuarioEntity, PsicologoEntity, PacienteEntity, ObraSocialEntity } from "@/entities"
import * as bcrypt from "bcrypt";

import { getDataSource } from "@/lib/database" // Importar el DataSource

export async function GET() {
  try {
    const usuarioRepo = await getRepository(UsuarioEntity)

    // Obtener todos los usuarios con sus relaciones
    const usuarios = await usuarioRepo.find({
      relations: {
        persona: true,
      },
      order: {
        persona: {
          apellido: "ASC",
          nombre: "ASC",
        },
      },
    })

    // Obtener psicólogos y pacientes por separado para evitar problemas de relaciones
    const psicologoRepo = await getRepository(PsicologoEntity)
    const pacienteRepo = await getRepository(PacienteEntity)

    const psicologos = await psicologoRepo.find({
      relations: {
        persona: true,
      },
    })

    const pacientes = await pacienteRepo.find({
      relations: {
        persona: true,
        obraSocial: true,
      },
    })

    // Crear mapas para búsqueda rápida
    const psicologoMap = new Map()
    psicologos.forEach((psi) => {
      if (psi.persona) {
        psicologoMap.set(psi.persona.id, psi)
      }
    })

    const pacienteMap = new Map()
    pacientes.forEach((pac) => {
      if (pac.persona) {
        pacienteMap.set(pac.persona.id, pac)
      }
    })

    // Enriquecer los datos de usuarios
    const usuariosEnriquecidos = usuarios.map((usuario) => {
      const psicologo = usuario.persona ? psicologoMap.get(usuario.persona.id) : null
      const paciente = usuario.persona ? pacienteMap.get(usuario.persona.id) : null

      return {
        id: usuario.id,
        email: usuario.email,
        activo: usuario.activo,
        ultimoAcceso: usuario.ultimoAcceso,
        persona: usuario.persona
          ? {
              id: usuario.persona.id,
              nombre: usuario.persona.nombre,
              apellido: usuario.persona.apellido,
              dni: usuario.persona.dni,
              fechaNacimiento: usuario.persona.fechaNacimiento,
            }
          : null,
        psicologo: psicologo
          ? {
              id: psicologo.id,
              especialidad: psicologo.especialidad,
              numeroLicencia: psicologo.numeroLicencia,
            }
          : null,
        paciente: paciente
          ? {
              id: paciente.id,
              obraSocial: paciente.obraSocial
                ? {
                    id: paciente.obraSocial.id,
                    nombre: paciente.obraSocial.nombre,
                    activo: paciente.obraSocial.activo,
                  }
                : null,
            }
          : null,
      }
    })

    return NextResponse.json(usuariosEnriquecidos)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ message: "Error al cargar usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const dataSource = await getDataSource();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const body = await request.json()
    const { persona, usuario, roles, psicologo, paciente } = body

    // Validaciones básicas
    if (!persona || !usuario) {
      // IMPORTANTE: Hacer rollback antes de devolver error
      await queryRunner.rollbackTransaction();
      return NextResponse.json(
        { message: "Datos incompletos", errors: { general: "Faltan datos requeridos" } },
        { status: 400 },
      )
    }

    // Obtener repositorios
    const personaRepo = queryRunner.manager.getRepository(PersonaEntity)
    const usuarioRepo = queryRunner.manager.getRepository(UsuarioEntity)
    const psicologoRepo = queryRunner.manager.getRepository(PsicologoEntity)
    const pacienteRepo = queryRunner.manager.getRepository(PacienteEntity)
    const obraSocialRepo = queryRunner.manager.getRepository(ObraSocialEntity)

    // Validaciones de duplicados
    const [existingPersona, existingUser] = await Promise.all([
      personaRepo.findOne({ where: { dni: persona.dni } }),      // 🔍 Busca por DNI -> existingPersona
      usuarioRepo.findOne({ where: { email: usuario.email } }),  // 📧 Busca por EMAIL -> existingUser
    ]);

    if (existingPersona) {
      await queryRunner.rollbackTransaction();
      return NextResponse.json(
        { message: "El DNI ya está registrado", errors: { dni: "Este DNI ya está en uso" } },
        { status: 400 },
      )
    }

    if (existingUser) {
      await queryRunner.rollbackTransaction();
      return NextResponse.json(
        { message: "El email ya está registrado", errors: { email: "Este email ya está en uso" } },
        { status: 400 },
      )
    }

    // Crear persona
    const nuevaPersona = personaRepo.create({
      nombre: persona.nombre,
      apellido: persona.apellido,
      dni: persona.dni,
      fechaNacimiento: new Date(persona.fechaNacimiento),
    })

    const personaGuardada = await personaRepo.save(nuevaPersona)

    // Crear usuario
    const hashedPassword = await bcrypt.hash(usuario.password, 12)
    const nuevoUsuario = usuarioRepo.create({
      email: usuario.email,
      password: hashedPassword,
      activo: usuario.activo,
      ultimoAcceso: new Date(usuario.ultimoAcceso),
      persona: personaGuardada,
    })

    // Guardar persona y usuario
    const usuarioGuardado = await usuarioRepo.save(nuevoUsuario)

    const resultados = {
      persona: personaGuardada,
      usuario: { ...usuarioGuardado, password: undefined },
      roles: [],
    }

    // Procesar rol de psicólogo
    if (roles.isPsicologo && psicologo) {
      const existingPsicologo = await psicologoRepo.findOne({
        where: { numeroLicencia: psicologo.numeroLicencia },
      })

      if (existingPsicologo) {
        // CORRECCIÓN: Rollback y retorno de error
        await queryRunner.rollbackTransaction();
        return NextResponse.json(
          {
            message: "El número de licencia ya está registrado",
            errors: { numeroLicencia: "Este número de licencia ya está en uso" },
          },
          { status: 400 },
        )
      }

      const nuevoPsicologo = psicologoRepo.create({
        especialidad: psicologo.especialidad,
        numeroLicencia: psicologo.numeroLicencia,
        persona: personaGuardada,
      })

      const psicologoGuardado = await psicologoRepo.save(nuevoPsicologo)
    }

    // Procesar rol de paciente
    if (roles.isPaciente && paciente) {
      const obraSocial = await obraSocialRepo.findOne({
        where: { id: paciente.id_obra_social },
      })

      if (!obraSocial) {
        // CORRECCIÓN: Rollback y retorno de error
        await queryRunner.rollbackTransaction();
        return NextResponse.json(
          {
            message: "Obra social no encontrada",
            errors: { selectedObraSocialId: "La obra social seleccionada no existe" },
          },
          { status: 400 },
        )
      }

      const nuevoPaciente = pacienteRepo.create({
        persona: personaGuardada,
        obraSocial: obraSocial,
      })

      const pacienteGuardado = await pacienteRepo.save(nuevoPaciente)
    }

    // Confirmar transacción si todo está bien
    await queryRunner.commitTransaction();

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        data: resultados,
      },
      { status: 201 },
    )
  } catch (error) {
    // Manejar errores inesperados
    await queryRunner.rollbackTransaction();
    console.error("Error al registrar usuario:", error);

    // Manejar errores de duplicados
    if (error instanceof Error) {
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json(
          { message: "Datos duplicados", errors: { general: "Ya existe un registro con estos datos" } },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      { message: "Error interno del servidor", errors: { general: "Ocurrió un error inesperado" } },
      { status: 500 },
    )
  } finally {
    // Liberar recursos
    await queryRunner.release();
  }
}
/*
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { persona, usuario, roles, psicologo, paciente } = body

    // Validar que los datos requeridos estén presentes
    if (!persona || !usuario || !roles) {
      return NextResponse.json(
        { message: "Datos incompletos", errors: { general: "Faltan datos requeridos" } },
        { status: 400 },
      )
    }

    // Validar que al menos un rol esté seleccionado
    //if (!roles.isPsicologo && !roles.isPaciente) {
    //  return NextResponse.json(
    //    { message: "Debe seleccionar al menos un rol", errors: { roleSelection: "Seleccione al menos un rol" } },
    //    { status: 400 },
    //  )
    //}

    // Obtener repositorios
    const personaRepo = await getRepository(PersonaEntity)
    const usuarioRepo = await getRepository(UsuarioEntity)
    const psicologoRepo = await getRepository(PsicologoEntity)
    const pacienteRepo = await getRepository(PacienteEntity)
    const obraSocialRepo = await getRepository(ObraSocialEntity)

    // Verificar si el email ya existe
    const existingUser = await usuarioRepo.findOne({
      where: { email: usuario.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "El email ya está registrado", errors: { email: "Este email ya está en uso" } },
        { status: 400 },
      )
    }

    // Verificar si el DNI ya existe
    const existingPersona = await personaRepo.findOne({
      where: { dni: persona.dni },
    })

    if (existingPersona) {
      return NextResponse.json(
        { message: "El DNI ya está registrado", errors: { dni: "Este DNI ya está en uso" } },
        { status: 400 },
      )
    }

    // Crear y guardar la persona
    const nuevaPersona = personaRepo.create({
      nombre: persona.nombre,
      apellido: persona.apellido,
      dni: persona.dni,
      fechaNacimiento: new Date(persona.fechaNacimiento),
    })

    const personaGuardada = await personaRepo.save(nuevaPersona)

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(usuario.password, 12)

    // Crear y guardar el usuario
    const nuevoUsuario = usuarioRepo.create({
      email: usuario.email,
      password: hashedPassword,
      activo: usuario.activo,
      ultimoAcceso: new Date(usuario.ultimoAcceso),
      persona: personaGuardada,
    })

    const usuarioGuardado = await usuarioRepo.save(nuevoUsuario)

    const resultados = {
      persona: personaGuardada,
      usuario: { ...usuarioGuardado, password: undefined }, // No devolver la contraseña
      roles: [],
    }

    // Si es psicólogo, crear y guardar el registro de psicólogo
    if (roles.isPsicologo && psicologo) {
      // Verificar si el número de licencia ya existe
      const existingPsicologo = await psicologoRepo.findOne({
        where: { numeroLicencia: psicologo.numeroLicencia },
      })

      if (existingPsicologo) {
        return NextResponse.json(
          {
            message: "El número de licencia ya está registrado",
            errors: { numeroLicencia: "Este número de licencia ya está en uso" },
          },
          { status: 400 },
        )
      }

      const nuevoPsicologo = psicologoRepo.create({
        especialidad: psicologo.especialidad,
        numeroLicencia: psicologo.numeroLicencia,
        persona: personaGuardada,
      })

      const psicologoGuardado = await psicologoRepo.save(nuevoPsicologo)
      //resultados.roles.push({ tipo: "psicologo", data: psicologoGuardado })
    }

    // Si es paciente, crear y guardar el registro de paciente
    if (roles.isPaciente && paciente) {
      // Verificar que la obra social existe
      const obraSocial = await obraSocialRepo.findOne({
        where: { id: paciente.id_obra_social },
      })

      if (!obraSocial) {
        return NextResponse.json(
          {
            message: "Obra social no encontrada",
            errors: { selectedObraSocialId: "La obra social seleccionada no existe" },
          },
          { status: 400 },
        )
      }

      const nuevoPaciente = pacienteRepo.create({
        persona: personaGuardada,
        obraSocial: obraSocial,
      })

      const pacienteGuardado = await pacienteRepo.save(nuevoPaciente)
      //resultados.roles.push({ tipo: "paciente", data: pacienteGuardado })
    }

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        data: resultados,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al registrar usuario:", error)

    // Manejar errores específicos de la base de datos
    if (error instanceof Error) {
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json(
          { message: "Datos duplicados", errors: { general: "Ya existe un registro con estos datos" } },
          { status: 400 },
        )
      }
    }

    return NextResponse.json(
      { message: "Error interno del servidor", errors: { general: "Ocurrió un error inesperado" } },
      { status: 500 },
    )
  }
}

/*
import { NextRequest } from 'next/server';
import { UsuarioController } from '@/lib/controllers/usuario.controller';

export async function GET(request: NextRequest) {
  return UsuarioController.getAllUsuarios(request);
}

export async function POST(request: NextRequest) {
  return UsuarioController.createUsuario(request);
}
  */