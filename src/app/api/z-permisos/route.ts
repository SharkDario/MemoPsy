import { NextResponse } from "next/server";
import { AppDataSource } from '@/lib/database';
import { Permiso, Modulo, Accion } from "@/entities";

export async function GET() {
  try {
    await AppDataSource.initialize();
    const permisoRepository = AppDataSource.getRepository(Permiso);
    const moduloRepository = AppDataSource.getRepository(Modulo);
    const accionRepository = AppDataSource.getRepository(Accion);
    
    // Primero creamos los módulos si no existen
    const modulos = [
      { nombre: 'Informes' },
      { nombre: 'Sesiones' }
    ];
    
    // Mapa para almacenar IDs de módulos
    const moduloIds = {};
    
    for (const moduloData of modulos) {
      let modulo = await moduloRepository.findOne({
        where: { nombre: moduloData.nombre }
      });
      
      if (!modulo) {
        modulo = new Modulo();
        modulo.nombre = moduloData.nombre;
        await moduloRepository.save(modulo);
        console.log(`Módulo '${moduloData.nombre}' creado.`);
      } else {
        console.log(`Módulo '${moduloData.nombre}' ya existe.`);
      }
      
      moduloIds[moduloData.nombre] = modulo.id;
    }
    
    // Luego creamos las acciones si no existen
    const acciones = [
      { nombre: 'Crear' },
      { nombre: 'Leer' },
      { nombre: 'Editar' },
      { nombre: 'Eliminar' },
      { nombre: 'Crear Recordatorio' },
      { nombre: 'Leer Recordatorio' },
      { nombre: 'Editar Recordatorio' },
      { nombre: 'Eliminar Recordatorio' },
      { nombre: 'Ver Calendario' },
      { nombre: 'Asignar Profesional' },
      { nombre: 'Ver Mis Sesiones' }
    ];
    
    // Mapa para almacenar IDs de acciones
    const accionIds = {};
    
    for (const accionData of acciones) {
      let accion = await accionRepository.findOne({
        where: { nombre: accionData.nombre }
      });
      
      if (!accion) {
        accion = new Accion();
        accion.nombre = accionData.nombre;
        await accionRepository.save(accion);
        console.log(`Acción '${accionData.nombre}' creada.`);
      } else {
        console.log(`Acción '${accionData.nombre}' ya existe.`);
      }
      
      accionIds[accionData.nombre] = accion.id;
    }
    
    // Definimos los permisos para el módulo de Informes
    const informesPermisos = [
      {
        nombre: 'CrearInforme',
        modulo: 'Informes',
        accion: 'Crear',
        descripcion: 'Crear informes de pacientes (información sensible)'
      },
      {
        nombre: 'LeerInforme',
        modulo: 'Informes',
        accion: 'Leer',
        descripcion: 'Visualizar informes de pacientes'
      },
      {
        nombre: 'EditarInforme',
        modulo: 'Informes',
        accion: 'Editar',
        descripcion: 'Editar informes de pacientes'
      },
      {
        nombre: 'EliminarInforme',
        modulo: 'Informes',
        accion: 'Eliminar',
        descripcion: 'Eliminar informes de pacientes'
      },
      {
        nombre: 'CrearRecordatorio',
        modulo: 'Informes',
        accion: 'Crear Recordatorio',
        descripcion: 'Crear recordatorios para el paciente'
      },
      {
        nombre: 'LeerRecordatorio',
        modulo: 'Informes',
        accion: 'Leer Recordatorio',
        descripcion: 'Visualizar recordatorios del paciente'
      },
      {
        nombre: 'EditarRecordatorio',
        modulo: 'Informes',
        accion: 'Editar Recordatorio',
        descripcion: 'Editar recordatorios del paciente'
      },
      {
        nombre: 'EliminarRecordatorio',
        modulo: 'Informes',
        accion: 'Eliminar Recordatorio',
        descripcion: 'Eliminar recordatorios del paciente'
      }
    ];
    
    // Definimos los permisos para el módulo de Sesiones
    const sesionesPermisos = [
      {
        nombre: 'CrearSesion',
        modulo: 'Sesiones',
        accion: 'Crear',
        descripcion: 'Crear/programar sesiones con pacientes'
      },
      {
        nombre: 'LeerSesion',
        modulo: 'Sesiones',
        accion: 'Leer',
        descripcion: 'Visualizar sesiones programadas'
      },
      {
        nombre: 'EditarSesion',
        modulo: 'Sesiones',
        accion: 'Editar',
        descripcion: 'Editar/reprogramar sesiones'
      },
      {
        nombre: 'EliminarSesion',
        modulo: 'Sesiones',
        accion: 'Eliminar',
        descripcion: 'Cancelar/eliminar sesiones'
      },
      {
        nombre: 'VerCalendarioCompleto',
        modulo: 'Sesiones',
        accion: 'Ver Calendario',
        descripcion: 'Ver todas las sesiones en el calendario (vista de recepción)'
      },
      {
        nombre: 'AsignarProfesional',
        modulo: 'Sesiones',
        accion: 'Asignar Profesional',
        descripcion: 'Asignar un profesional a una sesión'
      },
      {
        nombre: 'VerMisSesiones',
        modulo: 'Sesiones',
        accion: 'Ver Mis Sesiones',
        descripcion: 'Ver solo las sesiones asignadas al usuario (psicólogo o paciente)'
      }
    ];
    
    // Combinamos todos los permisos
    const allPermisos = [...informesPermisos, ...sesionesPermisos];
    
    // Creamos los permisos relacionándolos con los módulos y acciones correspondientes
    for (const permisoData of allPermisos) {
      const existingPermiso = await permisoRepository.findOne({
        where: { nombre: permisoData.nombre }
      });
      
      if (!existingPermiso) {
        const permiso = new Permiso();
        permiso.nombre = permisoData.nombre;
        permiso.descripcion = permisoData.descripcion;
        permiso.moduloId = moduloIds[permisoData.modulo];
        permiso.accionId = accionIds[permisoData.accion];
        
        await permisoRepository.save(permiso);
        console.log(`Permiso '${permisoData.nombre}' creado.`);
      } else {
        console.log(`Permiso '${permisoData.nombre}' ya existe.`);
      }
    }
    
    console.log('Seed completado con éxito.');
    //await AppDataSource.destroy();
    return NextResponse.json({ 
        success: true,
        message: "Seed completado con éxito."
      });
  } catch (error) {
    console.error('Error al ejecutar seed:', error);
    return NextResponse.json({ 
        success: false, 
        error: "Error al ejecutar seed" 
      }, { status: 500 });
    //if (AppDataSource.isInitialized) {
    //  await AppDataSource.destroy();
    //}
  }
}
/*
import { NextResponse } from "next/server";
import { AppDataSource } from '@/lib/database';
import { Permiso } from "@/entities";

export async function GET() {
  try {
    await AppDataSource.initialize();
    const permisoRepository = AppDataSource.getRepository(Permiso);
    
    // Permisos para el módulo de Informes
    const informesPermisos = [
      {
        nombre: 'CrearInforme',
        modulo: 'Informes',
        accion: 'Crear',
        descripcion: 'Crear informes de pacientes (información sensible)'
      },
      {
        nombre: 'LeerInforme',
        modulo: 'Informes',
        accion: 'Leer',
        descripcion: 'Visualizar informes de pacientes'
      },
      {
        nombre: 'EditarInforme',
        modulo: 'Informes',
        accion: 'Editar',
        descripcion: 'Editar informes de pacientes'
      },
      {
        nombre: 'EliminarInforme',
        modulo: 'Informes',
        accion: 'Eliminar',
        descripcion: 'Eliminar informes de pacientes'
      },
      {
        nombre: 'CrearRecordatorio',
        modulo: 'Informes',
        accion: 'Crear Recordatorio',
        descripcion: 'Crear recordatorios para el paciente'
      },
      {
        nombre: 'LeerRecordatorio',
        modulo: 'Informes',
        accion: 'Leer Recordatorio',
        descripcion: 'Visualizar recordatorios del paciente'
      },
      {
        nombre: 'EditarRecordatorio',
        modulo: 'Informes',
        accion: 'Editar Recordatorio',
        descripcion: 'Editar recordatorios del paciente'
      },
      {
        nombre: 'EliminarRecordatorio',
        modulo: 'Informes',
        accion: 'Eliminar Recordatorio',
        descripcion: 'Eliminar recordatorios del paciente'
      }
    ];
    
    // Permisos para el módulo de Sesiones
    const sesionesPermisos = [
      {
        nombre: 'CrearSesion',
        modulo: 'Sesiones',
        accion: 'Crear',
        descripcion: 'Crear/programar sesiones con pacientes'
      },
      {
        nombre: 'LeerSesion',
        modulo: 'Sesiones',
        accion: 'Leer',
        descripcion: 'Visualizar sesiones programadas'
      },
      {
        nombre: 'EditarSesion',
        modulo: 'Sesiones',
        accion: 'Editar',
        descripcion: 'Editar/reprogramar sesiones'
      },
      {
        nombre: 'EliminarSesion',
        modulo: 'Sesiones',
        accion: 'Eliminar',
        descripcion: 'Cancelar/eliminar sesiones'
      },
      {
        nombre: 'VerCalendarioCompleto',
        modulo: 'Sesiones',
        accion: 'Ver Calendario',
        descripcion: 'Ver todas las sesiones en el calendario (vista de recepción)'
      },
      {
        nombre: 'AsignarProfesional',
        modulo: 'Sesiones',
        accion: 'Asignar Profesional',
        descripcion: 'Asignar un profesional a una sesión'
      },
      {
        nombre: 'VerMisSesiones',
        modulo: 'Sesiones',
        accion: 'Ver Mis Sesiones',
        descripcion: 'Ver solo las sesiones asignadas al usuario (psicólogo o paciente)'
      }
    ];
    
    // Combinamos todos los permisos
    const allPermisos = [...informesPermisos, ...sesionesPermisos];
    
    // Verificamos si ya existen permisos con los mismos nombres
    for (const permisoData of allPermisos) {
      const existingPermiso = await permisoRepository.findOne({
        where: { nombre: permisoData.nombre }
      });
      
      if (!existingPermiso) {
        const permiso = new Permiso();
        permiso.nombre = permisoData.nombre;
        permiso.modulo = permisoData.modulo;
        permiso.accion = permisoData.accion;
        permiso.descripcion = permisoData.descripcion;
        await permisoRepository.save(permiso);
        console.log(`Permiso '${permisoData.nombre}' creado.`);
      } else {
        console.log(`Permiso '${permisoData.nombre}' ya existe.`);
      }
    }
    
    console.log('Seed completado con éxito.');
    //await AppDataSource.destroy();
    return NextResponse.json({ 
        success: true,
        message: "Seed completado con éxito."
      });
  } catch (error) {
    console.error('Error al ejecutar seed:', error);
    return NextResponse.json({ 
        success: false, 
        error: "Error al ejecutar seed" 
      }, { status: 500 });
    //if (AppDataSource.isInitialized) {
    //  await AppDataSource.destroy();
    //}
  }
}
  */