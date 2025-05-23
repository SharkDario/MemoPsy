// paciente-tiene-informe.model.ts
import { Base } from "./base-model";
import { Paciente } from "./paciente.model";
import { Informe } from "./informe.model";
import { PacienteTieneInformeEntity } from "../entities/paciente-tiene-informe.entity";

export class PacienteTieneInforme {
    private _informeId: string;
    private _pacienteId: string;
    private _informe: Informe;
    private _paciente: Paciente;

    constructor(data: {
        informeId?: string;
        pacienteId?: string;
        informe: Informe;
        paciente: Paciente;
    }) {
        this._informeId = data.informeId || '';
        this._pacienteId = data.pacienteId || '';
        this._informe = data.informe; // Usa el setter para validación
        this._paciente = data.paciente; // Usa el setter para validación
    }
    // Getters y Setters
    get informeId(): string { return this._informeId; }
    set informeId(value: string) {
      if (!value || value.trim() === '') {
        throw new Error('El ID del informe no puede estar vacío');
      }
      this._informeId = value;
    }
    get pacienteId(): string { return this._pacienteId; }
    set pacienteId(value: string) {
      if (!value || value.trim() === '') {
        throw new Error('El ID del paciente no puede estar vacío');
      }
      this._pacienteId = value;
    }
    get informe(): Informe { return this._informe; }
    set informe(value: Informe) {
      if (!value) {
        throw new Error('El informe no puede ser nulo');
      }
      this._informe = value;
    }
    get paciente(): Paciente { return this._paciente; }
    set paciente(value: Paciente) {
      if (!value) {
        throw new Error('El paciente no puede ser nulo');
      }
      this._paciente = value;
    }
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: PacienteTieneInformeEntity): PacienteTieneInforme {
      return new PacienteTieneInforme({
        pacienteId: entity.pacienteId,
        informeId: entity.informeId,
        informe: Informe.fromEntity(entity.informe),
        paciente: Paciente.fromEntity(entity.paciente)
      });
    }
    toEntity(): Partial<PacienteTieneInformeEntity> {
      return {
        pacienteId: this.pacienteId,
        informeId: this.informeId
      };
    }
}