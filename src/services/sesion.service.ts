// services/sesion.service.ts
import { SesionRepository } from '../repositories/sesion.repository';
import { ModalidadService } from './modalidad.service';
import { EstadoService } from './estado.service';
import { PsicologoService } from './psicologo.service';
import { CreateSesionDto, UpdateSesionDto, SesionResponseDto, SesionQueryDto, PaginatedSesionResponseDto } from '@/dto/sesion.dto';
