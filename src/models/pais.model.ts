// pais.model.ts
import { Base } from './base-model';
import { PaisEntity } from '../entities/pais.entity';

export class Pais extends Base {
    private _nombre: string;
    
    constructor(data: {
        id?: string;
        nombre: string;
    }) {
        super({ id: data.id });
        this._nombre = data.nombre;
    }
    get nombre(): string { return this._nombre; }
    set nombre(value: string) {
        if (!value || value.trim() === '') {
            throw new Error('El nombre no puede estar vacío');
        }
        this._nombre = value;
    }
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `País: ${this._nombre}`;
    }
    // Método para convertir a la entidad
    toEntity(): Partial<PaisEntity> {
        return {
            id: this.id,
            nombre: this.nombre,
            // No incluimos relaciones aquí
        };
    }
    // Método para convertir de entidad a modelo
    static fromEntity(entity: PaisEntity): Pais {
        return new Pais({
            id: entity.id,
            nombre: entity.nombre,
            // Aquí podrías mapear las ciudades si es necesario
        });
    }
}