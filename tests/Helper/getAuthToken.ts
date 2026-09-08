import { DIContainer } from '../../src/infrastructure/composition-root/di-container';

export const AUTH_TEST_CPF = '81788455045';

export function getAuthToken() {
    return DIContainer.getInstance()
        .getTokenPort()
        .sign({
            userId: 'auth-test',
            cpf: AUTH_TEST_CPF,
            email: 'ruann@gmail.com',
        });
}
