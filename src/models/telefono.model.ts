// telefono.model.ts
import { Base } from "./base-model";
import { Persona } from "./persona.model";
import { TelefonoEntity } from "../entities/telefono.entity";

export class Telefono extends Base {
    private _numero: string;
    private _persona?: Persona;

    constructor(data: {
        id?: string;
        numero: string;
        persona?: Persona;
    }) {
        super({ id: data.id });
        this._numero = data.numero; // Usa el setter para validación
        this._persona = data.persona;
    }

    // Getters y Setters
    get numero(): string { return this._numero; }
    set numero(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El número no puede estar vacío');
        }
        this._numero = value;
    }

    get persona(): Persona | undefined { return this._persona; }
    set persona(value: Persona | undefined) { this._persona = value; }

    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Número: ${this.numero}`;
    }

    // Método para convertir entre entidad y modelo
    static fromEntity(entity: TelefonoEntity): Telefono {
        return new Telefono({
        id: entity.id,
        numero: entity.numero,
        persona: entity.persona ? Persona.fromEntity(entity.persona) : undefined
        });
    }

    toEntity(): Partial<TelefonoEntity> {
        return {
        id: this.id,
        numero: this.numero
        // No incluimos relaciones aquí
        };
    }
}