// informe.model.ts
import { Base } from './base-model';
import { Psicologo } from './psicologo.model';
import { InformeEntity } from '../entities/informe.entity';

export class Informe extends Base {
    private _titulo: string;
    private _contenido: string;
    private _fechaCreacion: Date;
    private _esPrivado: boolean;
    private _psicologo?: Psicologo;

    constructor(data: {
        id?: string;
        titulo: string;
        contenido: string;
        fechaCreacion: Date;
        esPrivado: boolean;
        psicologo?: Psicologo;
        }) {
        super({ id: data.id });
        this._titulo = data.titulo; // Usa el setter para validación
        this._contenido = data.contenido; // Usa el setter para validación
        this._fechaCreacion = data.fechaCreacion;
        this._esPrivado = data.esPrivado;
        this._psicologo = data.psicologo;
    }
    // Getters y Setters
    get titulo(): string { return this._titulo; }
    set titulo(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El título no puede estar vacío');
        }
        this._titulo = value;
    }
    get contenido(): string { return this._contenido; }
    set contenido(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El contenido no puede estar vacío');
        }
        this._contenido = value;
    }
    get fechaCreacion(): Date { return this._fechaCreacion; }
    set fechaCreacion(value: Date) {
        if (!value) {
        throw new Error('La fecha de creación no puede estar vacía');
        }
        this._fechaCreacion = value;
    }
    get esPrivado(): boolean { return this._esPrivado; }
    set esPrivado(value: boolean) {
        if (typeof value !== 'boolean') {
        throw new Error('El valor de privacidad debe ser un booleano');
        }
        this._esPrivado = value;
    }
    get psicologo(): Psicologo | undefined { return this._psicologo; }
    set psicologo(value: Psicologo | undefined) {
        this._psicologo = value;
    }
    // Métodos de dominio
    // Aquí puedes agregar métodos específicos de la clase Informe
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Informe: ${this._titulo}, Contenido: ${this._contenido}, Fecha de Creación: ${this._fechaCreacion.toISOString()}, Es Privado: ${this._esPrivado}`;
    }
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: InformeEntity): Informe {
        return new Informe({
            id: entity.id,
            titulo: entity.titulo,
            contenido: entity.contenido,
            fechaCreacion: entity.fechaCreacion,
            esPrivado: entity.esPrivado,
            psicologo: entity.psicologo ? Psicologo.fromEntity(entity.psicologo) : undefined,
        });
    }
    toEntity(): Partial<InformeEntity> {
        return {
            id: this.id,
            titulo: this.titulo,
            contenido: this.contenido,
            fechaCreacion: this.fechaCreacion,
            esPrivado: this.esPrivado
        };
    }
}