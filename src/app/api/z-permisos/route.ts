import { NextResponse } from "next/server";
import { AppDataSource } from '@/lib/database';
import { PermisoEntity, ModuloEntity, AccionEntity, PerfilEntity, PerfilTienePermisoEntity } from "@/entities";

export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const perfilRepository = AppDataSource.getRepository(PerfilEntity);
    const perfilTienePermisoRepository = AppDataSource.getRepository(PerfilTienePermisoEntity);
    const permisoRepository = AppDataSource.getRepository(PermisoEntity);
    const moduloRepository = AppDataSource.getRepository(ModuloEntity);
    const accionRepository = AppDataSource.getRepository(AccionEntity);

    /*
    let perfilAdmin = new PerfilEntity();
    perfilAdmin.nombre = "Administrador";
    perfilAdmin.descripcion = "Administrador con todos los permisos"
    await perfilRepository.save(perfilAdmin);

    let moduloInformes = new ModuloEntity();
    moduloInformes.nombre = 'Informes';
    await moduloRepository.save(moduloInformes);
    let moduloSesiones = new ModuloEntity();
    moduloSesiones.nombre = 'Sesiones';
    await moduloRepository.save(moduloSesiones);
    let moduloPerfiles = new ModuloEntity();
    moduloPerfiles.nombre = 'Perfiles';
    await moduloRepository.save(moduloPerfiles);
    let moduloUsuarios = new ModuloEntity();
    moduloUsuarios.nombre = 'Usuarios';
    await moduloRepository.save(moduloUsuarios);
    let accionRegistrar = new AccionEntity();
    accionRegistrar.nombre = 'Registrar';
    await accionRepository.save(accionRegistrar);
    let accionVer = new AccionEntity();
    accionVer.nombre = 'Ver';
    await accionRepository.save(accionVer);
    let accionEditar = new AccionEntity();
    accionEditar.nombre = 'Editar';
    await accionRepository.save(accionEditar);
    let accionEliminar = new AccionEntity();
    accionEliminar.nombre = 'Eliminar';
    await accionRepository.save(accionEliminar);
    let accionAsignar = new AccionEntity();
    accionAsignar.nombre = 'Asignar';
    await accionRepository.save(accionAsignar);
    */

    //const moduloUsuarios = await moduloRepository.findOne({where: { nombre: 'Usuarios' }});
    const moduloInformes = await moduloRepository.findOne({where: { nombre: 'Informes' }});
    const moduloSesiones = await moduloRepository.findOne({where: { nombre: 'Sesiones' }});
    const accionRegistrar = await accionRepository.findOne({where: { nombre: 'Registrar' }});
    const accionVer = await accionRepository.findOne({where: { nombre: 'Ver' }});
    const accionEditar = await accionRepository.findOne({where: { nombre: 'Editar' }});
    const accionEliminar = await accionRepository.findOne({where: { nombre: 'Eliminar' }});
    const accionAsignar = await accionRepository.findOne({where: { nombre: 'Asignar' }});
    const perfilAdmin = await perfilRepository.findOne({where: {nombre: 'Administrador'}})

    if (!moduloInformes) {
      throw new Error("No se encontró el módulo 'Informes'");
    }
    if (!moduloSesiones) {
      throw new Error("No se encontró el módulo 'Sesiones'");
    }
    if (!accionRegistrar) {
      throw new Error("No se encontró la acción 'Registrar'");
    }
    if (!accionVer) {
      throw new Error("No se encontró la acción 'Ver'");
    }
    if (!accionEditar) {
      throw new Error("No se encontró la acción 'Editar'");
    }
    if (!accionEliminar) {
      throw new Error("No se encontró la acción 'Eliminar'");
    }
    if (!accionAsignar) {
      throw new Error("No se encontró la acción 'Asignar'");
    }
    if (!perfilAdmin) {
      throw new Error("No se encontró el perfil 'Administrador'");
    }

    //let permiso = new PermisoEntity();
    //let perfilTienePermiso = new PerfilTienePermisoEntity();
    /*
    permiso.nombre = 'Registrar Perfil';
    permiso.descripcion = 'Registrar un nuevo perfil';
    permiso.modulo = moduloPerfiles;
    permiso.accion = accionRegistrar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Eliminar Perfil';
    permiso.descripcion = 'Eliminar un perfil';
    permiso.modulo = moduloPerfiles;
    permiso.accion = accionEliminar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Editar Perfil';
    permiso.descripcion = 'Editar un perfil';
    permiso.modulo = moduloPerfiles;
    permiso.accion = accionEditar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Ver Perfiles';
    permiso.descripcion = 'Ver la lista de perfiles';
    permiso.modulo = moduloPerfiles;
    permiso.accion = accionVer;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Asignar Perfil';
    permiso.descripcion = 'Asignar un perfil a un Usuario';
    permiso.modulo = moduloPerfiles;
    permiso.accion = accionAsignar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Registrar Usuario';
    permiso.descripcion = 'Registrar un nuevo usuario';
    permiso.modulo = moduloUsuarios;
    permiso.accion = accionRegistrar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Ver Usuarios';
    permiso.descripcion = 'Ver la lista de usuarios';
    permiso.modulo = moduloUsuarios;
    permiso.accion = accionVer;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Editar Usuario';
    permiso.descripcion = 'Editar los datos de un usuario';
    permiso.modulo = moduloUsuarios;
    permiso.accion = accionEditar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Eliminar Usuario';
    permiso.descripcion = 'Eliminar un usuario';
    permiso.modulo = moduloUsuarios;
    permiso.accion = accionEliminar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);
    */

    /*
    let permiso = new PermisoEntity();
    permiso.nombre = 'Registrar Informe';
    permiso.descripcion = 'Registrar un nuevo informe de paciente';
    permiso.modulo = moduloInformes;
    permiso.accion = accionRegistrar;
    permiso = await permisoRepository.save(permiso);
    let perfilTienePermiso = new PerfilTienePermisoEntity();
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Ver Informes';
    permiso.descripcion = 'Ver la lista de informes de pacientes';
    permiso.modulo = moduloInformes;
    permiso.accion = accionVer;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Editar Informe';
    permiso.descripcion = 'Editar un informe de paciente';
    permiso.modulo = moduloInformes;
    permiso.accion = accionEditar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Eliminar Informe';
    permiso.descripcion = 'Eliminar un informe de paciente';
    permiso.modulo = moduloInformes;
    permiso.accion = accionEliminar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Registrar Sesión';
    permiso.descripcion = 'Registrar una nueva sesión con un paciente';
    permiso.modulo = moduloSesiones;
    permiso.accion = accionRegistrar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Ver Sesiones';
    permiso.descripcion = 'Ver la lista de sesiones programadas';
    permiso.modulo = moduloSesiones;
    permiso.accion = accionVer;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);
    */
    
    let permiso = new PermisoEntity();
    permiso = new PermisoEntity();
    permiso.nombre = 'Editar Sesión';
    permiso.descripcion = 'Editar una sesión programada';
    permiso.modulo = moduloSesiones;
    permiso.accion = accionEditar;
    permiso = await permisoRepository.save(permiso);
    let perfilTienePermiso = new PerfilTienePermisoEntity();
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Eliminar Sesión';
    permiso.descripcion = 'Eliminar una sesión programada';
    permiso.modulo = moduloSesiones;
    permiso.accion = accionEliminar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);

    permiso = new PermisoEntity();
    permiso.nombre = 'Asignar Profesional';
    permiso.descripcion = 'Asignar un profesional a una sesión';
    permiso.modulo = moduloSesiones;
    permiso.accion = accionAsignar;
    permiso = await permisoRepository.save(permiso);
    perfilTienePermiso.perfil = perfilAdmin;
    perfilTienePermiso.permiso = permiso;
    perfilTienePermiso.perfilId = perfilAdmin.id;
    perfilTienePermiso.permisoId = permiso.id;
    await perfilTienePermisoRepository.save(perfilTienePermiso);



    /*
    // Primero creamos los módulos si no existen
    const modulos = [
      { nombre: 'Informes' },
      { nombre: 'Sesiones' }
    ];
    
    // Mapa para almacenar IDs de módulos
    const moduloIds: { [key: string]: string } = {};
    
    for (const moduloData of modulos) {
      let modulo = await moduloRepository.findOne({
        where: { nombre: moduloData.nombre }
      });
      
      if (!modulo) {
        modulo = new ModuloEntity();
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
    const accionIds: { [key: string]: string } = {};
    
    for (const accionData of acciones) {
      let accion = await accionRepository.findOne({
        where: { nombre: accionData.nombre }
      });
      
      if (!accion) {
        accion = new AccionEntity();
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
        descripcion: 'Ver solo las sesiones asignadas al usuario (psicólogo y/o paciente)'
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
        const permiso = new PermisoEntity();
        permiso.nombre = permisoData.nombre;
        permiso.descripcion = permisoData.descripcion;
        const modulo = await moduloRepository.findOne({ where: { id: moduloIds[permisoData.modulo] } });
        if (!modulo) {
          throw new Error(`No se encontró el módulo con id: ${moduloIds[permisoData.modulo]}`);
        }
        permiso.modulo = modulo;

        const accion = await accionRepository.findOne({ where: { id: accionIds[permisoData.accion] } });
        if (!accion) {
          throw new Error(`No se encontró la acción con id: ${accionIds[permisoData.accion]}`);
        }
        permiso.accion = accion;
        
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
      */
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