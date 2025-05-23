export abstract class Base {
    private _id: string;
  
    constructor(data: {
          id?: string;
        }) {
          this._id = data.id || '';
        }
  
    get id(): string { return this._id; }
  
    abstract get info(): string;
}