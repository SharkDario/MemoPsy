// perfil.model.ts
import { Base } from "./base-model";
import { PerfilEntity } from "../entities/perfil.entity";

export class Perfil extends Base {
    private _nombre: string;
    private _descripcion: string;
    constructor(data: {
        id?: string;
        nombre: string;
        descripcion: string;
        }) {
        super({ id: data.id });
        this._nombre = data.nombre; // Usa el setter para validación
        this._descripcion = data.descripcion; // Usa el setter para validación
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
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Perfil: ${this._nombre}, Descripción: ${this._descripcion}`;
    }
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: PerfilEntity): Perfil {
        return new Perfil({
        id: entity.id,
        nombre: entity.nombre,
        descripcion: entity.descripcion
        });
    }
    toEntity(): Partial<PerfilEntity> {
        return {
        id: this.id,
        nombre: this.nombre,
        descripcion: this.descripcion
        // No incluimos relaciones aquí
        };
    }
}