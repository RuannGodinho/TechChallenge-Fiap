import { EmailConfigurationError } from '../../src/application/errors/email.errors';
import { loadSmtpConfig } from '../../src/config/smtp';

describe('loadSmtpConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('deve carregar configuracao SMTP completa', () => {
        process.env.SMTP_HOST = 'smtp.gmail.com';
        process.env.SMTP_PORT = '587';
        process.env.SMTP_USER = 'sender@example.com';
        process.env.SMTP_PASS = 'secret';
        process.env.ORCAMENTO_EMAIL_TO = 'cliente@exemplo.com';

        const config = loadSmtpConfig();

        expect(config).toEqual({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            user: 'sender@example.com',
            pass: 'secret',
            from: 'sender@example.com',
            orcamentoRecipient: 'cliente@exemplo.com',
        });
    });

    test('deve falhar quando ORCAMENTO_EMAIL_TO nao estiver configurado', () => {
        process.env.SMTP_HOST = 'smtp.gmail.com';
        process.env.SMTP_PORT = '587';
        process.env.SMTP_USER = 'sender@example.com';
        process.env.SMTP_PASS = 'secret';
        delete process.env.ORCAMENTO_EMAIL_TO;

        expect(() => loadSmtpConfig()).toThrow(EmailConfigurationError);
        expect(() => loadSmtpConfig()).toThrow('ORCAMENTO_EMAIL_TO');
    });

    test('deve falhar quando SMTP_PORT for invalido', () => {
        process.env.SMTP_HOST = 'smtp.gmail.com';
        process.env.SMTP_PORT = 'abc';
        process.env.SMTP_USER = 'sender@example.com';
        process.env.SMTP_PASS = 'secret';
        process.env.ORCAMENTO_EMAIL_TO = 'cliente@exemplo.com';

        expect(() => loadSmtpConfig()).toThrow(EmailConfigurationError);
        expect(() => loadSmtpConfig()).toThrow('SMTP_PORT');
    });
});
