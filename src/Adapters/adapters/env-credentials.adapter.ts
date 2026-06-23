import { authMock } from '../../config/auth';
import { ICredentialsPort } from '../../application/ports/credentials.port';

export class EnvCredentialsAdapter implements ICredentialsPort {
    isValid(email: string, password: string): boolean {
        return email === authMock.email && password === authMock.password;
    }
}
