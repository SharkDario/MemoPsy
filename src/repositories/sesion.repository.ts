// repositories/sesion.repository.ts
import { Repository, DataSource } from 'typeorm';
import { SesionEntity } from '../entities/index';
import { CreateSesionDto, UpdateSesionDto, SesionQueryDto, SesionResponseDto, PaginatedSesionResponseDto } from '../dto/sesion.dto';