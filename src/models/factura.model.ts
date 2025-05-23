// factura.model.ts
import { Base } from "./base-model";
import { FacturaEntity } from "../entities/factura.entity";
import { TipoFactura } from "./tipo-factura.model";
import { MedioDePago } from "./medio-de-pago.model";
import { DetalleFactura } from "./detalle-factura.model";
import { PersonaTieneFactura } from "./persona-tiene-factura.model";

export class Factura extends Base {
    private _numero: string;
    private _fechaEmision: Date;
    private _tipoFactura?: TipoFactura;
    private _medioDePago?: MedioDePago;

    constructor(data: {
        id?: string;
        numero: string;
        fechaEmision: Date;
        tipoFactura?: TipoFactura;
        medioDePago?: MedioDePago;
    }) {
        super({ id: data.id });
        this._numero = data.numero; // Usa el setter para validación
        this._fechaEmision = data.fechaEmision; // Usa el setter para validación
        this._tipoFactura = data.tipoFactura;
        this._medioDePago = data.medioDePago;
    }

    // Getters y Setters
    get numero(): string { return this._numero; }
    set numero(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El número no puede estar vacío');
        }
        this._numero = value;
    }

    get fechaEmision(): Date { return this._fechaEmision; }
    set fechaEmision(value: Date) {
    if (!value) {
        throw new Error('La fecha de emisión no puede estar vacía');
    }
        this._fechaEmision = value;
    }

    get tipoFactura(): TipoFactura | undefined { return this._tipoFactura; }
    set tipoFactura(value: TipoFactura | undefined) {
        if (value && !(value instanceof TipoFactura)) {
        throw new Error('El tipo de factura debe ser una instancia de TipoFactura');
        }
        this._tipoFactura = value;
    }

    get medioDePago(): MedioDePago | undefined { return this._medioDePago; }
    set medioDePago(value: MedioDePago | undefined) {
        if (value && !(value instanceof MedioDePago)) {
        throw new Error('El medio de pago debe ser una instancia de MedioDePago');
        }
        this._medioDePago = value;
    }
    
    // Método para convertir entre entidad y modelo
    static fromEntity(entity: FacturaEntity): Factura {
        return new Factura({
        id: entity.id,
        numero: entity.numero,
        fechaEmision: entity.fechaEmision,
        tipoFactura: entity.tipoFactura ? TipoFactura.fromEntity(entity.tipoFactura) : undefined,
        medioDePago: entity.medioDePago ? MedioDePago.fromEntity(entity.medioDePago) : undefined,
        });
    }
    toEntity(): Partial<FacturaEntity> {
        return {
            id: this.id,
            numero: this.numero,
            fechaEmision: this.fechaEmision,
        };
    }
    // Sobrescribimos el método info de la clase Base (polimorfismo)
    override get info(): string {
        return `Factura: ${this.numero}, Fecha de Emisión: ${this.fechaEmision.toLocaleDateString()}`;
    }
}