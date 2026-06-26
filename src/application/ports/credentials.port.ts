export interface ICredentialsPort {
    isValid(email: string, password: string): boolean;
}
