// sesion.model.ts
import { Base } from "./base-model";
import { SesionEntity } from "../entities/sesion.entity";
import { Psicologo } from "./psicologo.model";
import { Modalidad } from "./modalidad.model";
import { Estado } from "./estado.model";

export class Sesion extends Base {
    private _fechaHoraInicio: Date;
    private _fechaHoraFin: Date;
    private _psicologo?: Psicologo;
    private _modalidad?: Modalidad;
    private _estado?: Estado;
    
    constructor(data: {
        id?: string;
        fechaHoraInicio: Date;
        fechaHoraFin: Date;
        psicologo?: Psicologo;
        modalidad?: Modalidad;
        estado?: Estado;
    }) {
        super({ id: data.id });
        this._fechaHoraInicio = data.fechaHoraInicio; // Usa el setter para validación
        this._fechaHoraFin = data.fechaHoraFin; // Usa el setter para validación
        this._psicologo = data.psicologo;
        this._modalidad = data.modalidad;
        this._estado = data.estado;
    }
    
    // Getters y Setters
    get fechaHoraInicio(): Date { return this._fechaHoraInicio; }
    set fechaHoraInicio(value: Date) {
        if (!value) {
        throw new Error('La fecha y hora de inicio no pueden estar vacías');
        }
        this._fechaHoraInicio = value;
    }
    
    get fechaHoraFin(): Date { return this._fechaHoraFin; }
    set fechaHoraFin(value: Date) {
        if (!value) {
        throw new Error('La fecha y hora de fin no pueden estar vacías');
        }
        this._fechaHoraFin = value;
    }
    
    get psicologo(): Psicologo | undefined { return this._psicologo; }
    set psicologo(value: Psicologo | undefined) { this._psicologo = value; }
    
    get modalidad(): Modalidad | undefined { return this._modalidad; }
    set modalidad(value: Modalidad | undefined) { this._modalidad = value; }
    
    get estado(): Estado | undefined { return this._estado; }
    set estado(value: Estado | undefined) { this._estado = value; }
    
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Fecha y Hora Inicio: ${this.fechaHoraInicio}, Fecha y Hora Fin: ${this.fechaHoraFin}`;
    }
    
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: SesionEntity): Sesion {
        return new Sesion({
        id: entity.id,
        fechaHoraInicio: entity.fechaHoraInicio,
        fechaHoraFin: entity.fechaHoraFin,
        psicologo: entity.psicologo ? Psicologo.fromEntity(entity.psicologo) : undefined,
        modalidad: entity.modalidad ? Modalidad.fromEntity(entity.modalidad) : undefined,
        estado: entity.estado ? Estado.fromEntity(entity.estado) : undefined
        });
    }
    toEntity(): Partial<SesionEntity> {
        return {
        id: this.id,
        fechaHoraInicio: this.fechaHoraInicio,
        fechaHoraFin: this.fechaHoraFin,
        };
    }
}