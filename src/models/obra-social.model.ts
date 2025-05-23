// obra-social.model.ts
import { Base } from "./base-model";
import { ObraSocialEntity } from "../entities/obra-social.entity";

export class ObraSocial extends Base {
    private _nombre: string;
    private _activo: boolean;

    constructor(data: {
        id?: string;
        nombre: string;
        activo: boolean;
    }) {
        super({ id: data.id });
        this._nombre = data.nombre; // Usa el setter para validación
        this._activo = data.activo; // Usa el setter para validación
    }
    // Getters y Setters
    get nombre(): string { return this._nombre; }
    set nombre(value: string) {
      if (!value || value.trim() === '') {
        throw new Error('El nombre no puede estar vacío');
      }
      this._nombre = value;
    }
    get activo(): boolean { return this._activo; }
    set activo(value: boolean) {
      if (typeof value !== 'boolean') {
        throw new Error('El estado activo debe ser un booleano');
      }
      this._activo = value;
    }
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Nombre: ${this.nombre}, Activo: ${this.activo}`;
    }
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: ObraSocialEntity): ObraSocial {
      return new ObraSocial({
        id: entity.id,
        nombre: entity.nombre,
        activo: entity.activo
      });
    }
    toEntity(): Partial<ObraSocialEntity> {
      return {
        id: this.id,
        nombre: this.nombre,
        activo: this.activo
        // No incluimos relaciones aquí
      };
    }
}