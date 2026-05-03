export class PlacaValidator {
  static isValid(placa: string): boolean {
    const clean = placa.replace(/[-\s]/g, "").toUpperCase();

    const antiga = /^[A-Z]{3}[0-9]{4}$/;
    const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return antiga.test(clean) || mercosul.test(clean);
  }
}