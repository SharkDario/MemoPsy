// permiso.model.ts
import { Base } from "./base-model";
import { PermisoEntity } from "../entities/permiso.entity";
import { Modulo } from "./modulo.model";
import { Accion } from "./accion.model";

export class Permiso extends Base {
    private _nombre: string;
    private _descripcion: string;
    private _modulo?: Modulo;
    private _accion?: Accion;

    constructor(data: {
        id?: string;
        nombre: string;
        descripcion: string;
        modulo?: Modulo;
        accion?: Accion;
    }) {
        super({ id: data.id });
        this._nombre = data.nombre; // Usa el setter para validación
        this._descripcion = data.descripcion; // Usa el setter para validación
        this._modulo = data.modulo;
        this._accion = data.accion;
    }

    // Getters y Setters
    get nombre(): string { return this._nombre; }
    set nombre(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El nombre no puede estar vacío');
        }
        this._nombre = value;
    }

    get descripcion(): string { return this._descripcion; }
    set descripcion(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('La descripción no puede estar vacía');
        }
        this._descripcion = value;
    }

    get modulo(): Modulo | undefined { return this._modulo; }
    set modulo(value: Modulo | undefined) { this._modulo = value; }

    get accion(): Accion | undefined { return this._accion; }
    set accion(value: Accion | undefined) { this._accion = value; }

    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Permiso: ${this.nombre}, Descripción: ${this.descripcion}`;
    }

    // Método para convertir entre entidad y modelo
    static fromEntity(entity: PermisoEntity): Permiso {
        return new Permiso({
        id: entity.id,
        nombre: entity.nombre,
        descripcion: entity.descripcion,
        modulo: entity.modulo ? Modulo.fromEntity(entity.modulo) : undefined,
        accion: entity.accion ? Accion.fromEntity(entity.accion) : undefined
        });
    }

    toEntity(): Partial<PermisoEntity> {
        return {
        id: this.id,
        nombre: this.nombre,
        descripcion: this.descripcion,
        }
    }
}