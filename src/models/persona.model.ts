// persona.model.ts
import { Base } from "./base-model";
import { PersonaEntity } from "../entities/persona.entity";

export class Persona extends Base {
    private _nombre: string;
    private _apellido: string;
    private _dni: string;
    private _fechaNacimiento: Date;
    
    constructor(data: {
        id?: string;
        nombre: string;
        apellido: string;
        dni: string;
        fechaNacimiento: Date;
    }) {
        super({ id: data.id });
        this._nombre = data.nombre; // Usa el setter para validación
        this._apellido = data.apellido; // Usa el setter para validación
        this._dni = data.dni; // Usa el setter para validación
        this._fechaNacimiento = data.fechaNacimiento; // Usa el setter para validación
    }
    
    // Getters y Setters
    get nombre(): string { return this._nombre; }
    set nombre(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El nombre no puede estar vacío');
        }
        this._nombre = value;
    }
    
    get apellido(): string { return this._apellido; }
    set apellido(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El apellido no puede estar vacío');
        }
        this._apellido = value;
    }
    
    get dni(): string { return this._dni; }
    set dni(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El DNI no puede estar vacío');
        }
        this._dni = value;
    }
    
    get fechaNacimiento(): Date { return this._fechaNacimiento; }
    set fechaNacimiento(value: Date) {
        if (!value) {
        throw new Error('La fecha de nacimiento no puede estar vacía');
        }
        this._fechaNacimiento = value;
    }
    
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Nombre: ${this.nombre}, Apellido: ${this.apellido}, DNI: ${this.dni}, Fecha de Nacimiento: ${this.fechaNacimiento}`;
    }
    
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: PersonaEntity): Persona {
        return new Persona({
        id: entity.id,
        nombre: entity.nombre,
        apellido: entity.apellido,
        dni: entity.dni,
        fechaNacimiento: entity.fechaNacimiento,
        });
    }
    
    toEntity(): Partial<PersonaEntity> {
        return {
        id: this.id,
        nombre: this.nombre,
        apellido: this.apellido,
        dni: this.dni,
        fechaNacimiento: this.fechaNacimiento,
        // No incluimos relaciones aquí
        };
    }
}