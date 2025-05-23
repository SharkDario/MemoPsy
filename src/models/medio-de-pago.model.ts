// medio-de-pago.model.ts
import { Base } from "./base-model";
import { MedioDePagoEntity } from "../entities/medio-de-pago.entity";

export class MedioDePago extends Base {
    private _descripcion: string;
    
    constructor(data: {
        id?: string;
        descripcion: string;
    }) {
        super({ id: data.id });
        this._descripcion = data.descripcion; // Usa el setter para validación
    }   
    // Getters y Setters
    get descripcion(): string { return this._descripcion; }
    set descripcion(value: string) {
        if (!value || value.trim() === '') {
            throw new Error('La descripción no puede estar vacía');
        }
        this._descripcion = value;
    }
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Descripción: ${this.descripcion}`;
    }
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: MedioDePagoEntity): MedioDePago {
        return new MedioDePago({
            id: entity.id,
            descripcion: entity.descripcion,
        });
    }
    toEntity(): Partial<MedioDePagoEntity> {
        return {
            id: this.id,
            descripcion: this.descripcion,
            // No incluimos relaciones aquí
        };
    }
}