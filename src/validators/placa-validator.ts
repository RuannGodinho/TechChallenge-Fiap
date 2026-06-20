import { Placa } from '../enterprise/value-objects/placa.vo';

export class PlacaValidator {
    static isValid(placa: string): boolean {
        try {
            Placa.from(placa);
            return true;
        } catch {
            return false;
        }
    }
}
