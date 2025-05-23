// paciente-tiene-sesion.model.ts
import { Paciente } from './paciente.model';
import { Sesion } from './sesion.model';
import { PacienteTieneSesionEntity } from '../entities/paciente-tiene-sesion.entity';

export class PacienteTieneSesion {
    private _sesionId: string;
    private _pacienteId: string;
    private _sesion: Sesion;
    private _paciente: Paciente;
    
    constructor(data: {
        sesion: Sesion;
        paciente: Paciente;
        sesionId?: string;
        pacienteId?: string;
    }) {
        this._sesion = data.sesion;
        this._paciente = data.paciente;
        this._sesionId = data.sesionId || this._sesion.id;
        this._pacienteId = data.pacienteId || this._paciente.id;
    }
    
    get sesion(): Sesion { return this._sesion; }
    set sesion(value: Sesion) {
        if (!value) {
            throw new Error('La sesión no puede ser nula');
        }
        this._sesion = value;
    }
    get sesionId(): string { return this._sesionId; }
    set sesionId(value: string) {
        if (!value || value.trim() === '') {
            throw new Error('El ID de la sesión no puede estar vacío');
        }
        this._sesionId = value;
    }
    get pacienteId(): string { return this._pacienteId; }
    set pacienteId(value: string) {
        if (!value || value.trim() === '') {
            throw new Error('El ID del paciente no puede estar vacío');
        }
        this._pacienteId = value;
    }
    get paciente(): Paciente { return this._paciente; }
    set paciente(value: Paciente) {
        if (!value) {
            throw new Error('El paciente no puede ser nulo');
        }
        this._paciente = value;
    }
    
    // Método para convertir de entidad a modelo
    static fromEntity(entity: PacienteTieneSesionEntity): PacienteTieneSesion {
        return new PacienteTieneSesion({
            pacienteId: entity.pacienteId,
            sesionId: entity.sesionId,
            paciente: Paciente.fromEntity(entity.paciente),
            sesion: Sesion.fromEntity(entity.sesion)
        });
    }
    // Método para convertir a entidad
    toEntity(): Partial<PacienteTieneSesionEntity> {
        return {
            sesionId: this.sesion.id,
            pacienteId: this.paciente.id
        };
    }
}