// modalidad.model.ts
import { Base } from "./base-model";
import { ModalidadEntity } from "../entities/modalidad.entity";

export class Modalidad extends Base {
    private _nombre: string;

    constructor(data: {
        id?: string;
        nombre: string;
    }) {
        super({ id: data.id });
        this._nombre = data.nombre; // Usa el setter para validación
    }

    // Getters y Setters
    get nombre(): string { return this._nombre; }
    set nombre(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El nombre no puede estar vacío');
        }
        this._nombre = value;
    }
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Nombre: ${this.nombre}`;
    }
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: ModalidadEntity): Modalidad {
        return new Modalidad({
            id: entity.id,
            nombre: entity.nombre,
        });
    }
    toEntity(): Partial<ModalidadEntity> {
        return {
            id: this.id,
            nombre: this.nombre,
            // No incluimos relaciones aquí
        };
    }
}