// src/app/api/informes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth/auth-config';
import { initializeDatabase } from '@/lib/database';
import { InformeEntity } from '@/entities/informe.entity';
import { PacienteTieneInformeEntity } from '@/entities/paciente-tiene-informe.entity';
import { PsicologoEntity } from '@/entities/psicologo.entity';
import { PacienteEntity } from '@/entities/paciente.entity';
import { AppDataSource } from '@/lib/database';
import { In } from 'typeorm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const hasPermission = session.user.permisos?.includes('Ver Informes');
    if (!hasPermission) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }
    const informeRepository = AppDataSource.getRepository(InformeEntity);
    const pacienteTieneInformeRepository = AppDataSource.getRepository(PacienteTieneInformeEntity);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const pacienteQuery = searchParams.get('paciente'); // Name or DNI
    const sortBy = searchParams.get('sortBy') || 'informe.fechaCreacion'; // Default sort column
    const sortOrder = searchParams.get('sortOrder')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // Default sort order

    let informesData: any[] = [];
    let totalInformes = 0;

    if (session.user.psicologoId) {
      const queryBuilder = informeRepository.createQueryBuilder('informe')
        .leftJoinAndSelect('informe.psicologo', 'psicologo')
        .leftJoinAndSelect('psicologo.persona', 'psicologoPersona')
        .where('informe.psicologo_id = :psicologoId', { psicologoId: session.user.psicologoId });

      if (pacienteQuery) {
        queryBuilder.leftJoin('informe.pacientesInformes', 'pti')
                    .leftJoin('pti.paciente', 'paciente')
                    .leftJoin('paciente.persona', 'pacientePersona')
                    .andWhere('(pacientePersona.nombre LIKE :query OR pacientePersona.apellido LIKE :query OR pacientePersona.dni LIKE :query)', 
                              { query: `%${pacienteQuery}%` });
      }
      
      queryBuilder.orderBy(sortBy, sortOrder as 'ASC' | 'DESC');
      
      totalInformes = await queryBuilder.getCount();
      const informes = await queryBuilder.skip((page - 1) * limit).take(limit).getMany();

      informesData = await Promise.all(informes.map(async (informe) => {
        const pacientesInformes = await pacienteTieneInformeRepository.find({
          where: { informe: { id: informe.id } },
          relations: ['paciente', 'paciente.persona'],
        });
        return {
          ...informe,
          pacientes: pacientesInformes.map(pti => ({
            id: pti.paciente.id,
            nombre: `${pti.paciente.persona.nombre} ${pti.paciente.persona.apellido}`,
            dni: pti.paciente.persona.dni,
          })),
          psicologo: {
            id: informe.psicologo.id,
            nombre: `${informe.psicologo.persona.nombre} ${informe.psicologo.persona.apellido}`,
          }
        };
      }));

    } else if (session.user.pacienteId) {
      // For Paciente, filter PacienteTieneInforme first, then join and filter Informe
      const ptiQueryBuilder = pacienteTieneInformeRepository.createQueryBuilder('pti')
        .innerJoinAndSelect('pti.informe', 'informe')
        .leftJoinAndSelect('informe.psicologo', 'psicologo')
        .leftJoinAndSelect('psicologo.persona', 'psicologoPersona')
        .where('pti.paciente_id = :pacienteId', { pacienteId: session.user.pacienteId })
        .andWhere('informe.esPrivado = :esPrivado', { esPrivado: false });

      if (sortBy.startsWith('informe.')) { // Ensure sorting is on informe table
          ptiQueryBuilder.orderBy(sortBy, sortOrder as 'ASC' | 'DESC');
      } else {
          ptiQueryBuilder.orderBy('informe.fechaCreacion', 'DESC'); // Default for paciente
      }
      
      totalInformes = await ptiQueryBuilder.getCount();
      const pacienteInformesFiltrados = await ptiQueryBuilder.skip((page - 1) * limit).take(limit).getMany();

      informesData = pacienteInformesFiltrados.map(pti => ({
        ...pti.informe,
        psicologo: {
          id: pti.informe.psicologo.id,
          nombre: `${pti.informe.psicologo.persona.nombre} ${pti.informe.psicologo.persona.apellido}`,
        },
      }));

    } else {
      return NextResponse.json({ message: 'Rol no especificado o no válido para esta acción' }, { status: 403 });
    }

    return NextResponse.json({
      data: informesData,
      page,
      limit,
      total: totalInformes,
      totalPages: Math.ceil(totalInformes / limit),
    }, { status: 200 });

  } catch (error) {
    console.error('Error en GET /api/informes:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const hasPermission = session.user.permisos?.includes('Registrar Informe');
    if (!hasPermission || !session.user.psicologoId) {
      return NextResponse.json({ message: 'Acceso denegado o rol no válido' }, { status: 403 });
    }

    const body = await request.json();
    const { titulo, contenido, esPrivado, pacientesIds } = body;

    if (!titulo || !contenido || typeof esPrivado !== 'boolean') {
      return NextResponse.json({ message: 'Datos incompletos o inválidos: titulo, contenido y esPrivado son requeridos.' }, { status: 400 });
    }
    if (pacientesIds && (!Array.isArray(pacientesIds) || !pacientesIds.every(id => typeof id === 'string'))) {
        return NextResponse.json({ message: 'pacientesIds debe ser un array de strings.' }, { status: 400 });
    }


    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }
    const informeRepository = AppDataSource.getRepository(InformeEntity);
    const pacienteTieneInformeRepository = AppDataSource.getRepository(PacienteTieneInformeEntity);
    const psicologoRepository = AppDataSource.getRepository(PsicologoEntity);
    const pacienteRepository = AppDataSource.getRepository(PacienteEntity);

    const psicologo = await psicologoRepository.findOneBy({ id: session.user.psicologoId });
    if (!psicologo) {
        return NextResponse.json({ message: 'Psicólogo no encontrado' }, { status: 404 });
    }

    const nuevoInforme = informeRepository.create({
      titulo,
      contenido,
      esPrivado,
      fechaCreacion: new Date(),
      psicologo: psicologo,
    });

    const informeGuardado = await informeRepository.save(nuevoInforme);

    let ptiEntitiesGuardadas: PacienteTieneInformeEntity[] = [];
    if (pacientesIds && pacientesIds.length > 0) {
      const existingPacientes = await pacienteRepository.findBy({ id: In(pacientesIds) });
      if(existingPacientes.length !== pacientesIds.length){
          const notFoundIds = pacientesIds.filter(id => !existingPacientes.some(p => p.id === id));
          return NextResponse.json({ message: `Pacientes con IDs ${notFoundIds.join(', ')} no encontrados.` }, { status: 400 });
      }

      const ptiEntities = pacientesIds.map(pacienteId => 
        pacienteTieneInformeRepository.create({
          informe: informeGuardado,
          paciente: { id: pacienteId } as PacienteEntity,
        })
      );
      ptiEntitiesGuardadas = await pacienteTieneInformeRepository.save(ptiEntities);
    }
    
    const informeCompleto = await informeRepository.findOne({
        where: { id: informeGuardado.id },
        relations: ['psicologo', 'psicologo.persona']
    });

    const pacientesDelInforme = await pacienteTieneInformeRepository.find({
        where: { informe: { id: informeGuardado.id } },
        relations: ['paciente', 'paciente.persona']
    });

    const responseData = {
        ...informeCompleto,
        psicologo: informeCompleto?.psicologo ? {
            id: informeCompleto.psicologo.id,
            nombre: `${informeCompleto.psicologo.persona.nombre} ${informeCompleto.psicologo.persona.apellido}`
        } : undefined,
        pacientes: pacientesDelInforme.map(pti => ({
            id: pti.paciente.id,
            nombre: `${pti.paciente.persona.nombre} ${pti.paciente.persona.apellido}`,
            dni: pti.paciente.persona.dni 
        }))
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/informes:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('UQ_')) {
        return NextResponse.json({ message: 'Error: Ya existe un informe con datos similares o clave única duplicada.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}

/*
import { NextRequest } from 'next/server';
import { InformeController } from '@/lib/controllers/informe.controller';

export async function GET(request: NextRequest) {
  return InformeController.getAllInformes(request);
}

export async function POST(request: NextRequest) {
  return InformeController.createInforme(request);
}
  */
