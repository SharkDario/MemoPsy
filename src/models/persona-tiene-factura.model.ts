// persona-tiene-factura.model.ts
import { Persona } from "./persona.model";
import { Factura } from "./factura.model";
import { PersonaTieneFacturaEntity } from "../entities/persona-tiene-factura.entity";

export class PersonaTieneFactura {
    private _persona: Persona;
    private _factura: Factura;
    private _personaId: string;
    private _facturaId: string;

    constructor(data: {
        personaId?: string;
        facturaId?: string;
        persona: Persona;
        factura: Factura;
        }) {
        this._personaId = data.personaId || data.persona.id;
        this._facturaId = data.facturaId || data.factura.id;
        this._persona = data.persona;
        this._factura = data.factura;
        }
    // Getters y Setters
    get personaId(): string { return this._personaId; }
    set personaId(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El ID de la persona no puede estar vacío');
        }
        this._personaId = value;
        }
    get facturaId(): string { return this._facturaId; }
    set facturaId(value: string) {
        if (!value || value.trim() === '') {
        throw new Error('El ID de la factura no puede estar vacío');
        }
        this._facturaId = value;
        }
    get persona(): Persona { return this._persona; }
    set persona(value: Persona) {
        if (!value) {
        throw new Error('La persona no puede estar vacía');
        }
        this._persona = value;
        }
    get factura(): Factura { return this._factura; }
    set factura(value: Factura) {
        if (!value) {
        throw new Error('La factura no puede estar vacía');
        }
        this._factura = value;
        }
    // Métodos para convertir entre entidad y modelo
    static fromEntity(entity: PersonaTieneFacturaEntity): PersonaTieneFactura {
        return new PersonaTieneFactura({
            personaId: entity.personaId,
            facturaId: entity.facturaId,
            persona: Persona.fromEntity(entity.persona),
            factura: Factura.fromEntity(entity.factura)
        });
    }
    toEntity(): Partial<PersonaTieneFacturaEntity> {
        return {
            personaId: this.personaId,
            facturaId: this.facturaId,
        };
    }
}
    

/*
// persona-tiene-factura.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { PersonaEntity } from "./persona.entity";
import { FacturaEntity } from "./factura.entity";

@Entity({ name: "persona_tiene_factura" })
export class PersonaTieneFacturaEntity {
  @PrimaryColumn({ name: "persona_id" })
  personaId: string;
     
  @PrimaryColumn({ name: "factura_id" })
  facturaId: string;

  @ManyToOne(() => PersonaEntity)
  @JoinColumn({ name: "persona_id" })
  persona: PersonaEntity;

  @ManyToOne(() => FacturaEntity)
  @JoinColumn({ name: "factura_id" })
  factura: FacturaEntity;
}
*/