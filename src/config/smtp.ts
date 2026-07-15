import { EmailConfigurationError } from '../application/errors/email.errors';

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    orcamentoRecipient: string;
}

function readRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new EmailConfigurationError(
            `Variável de ambiente obrigatória ausente: ${name}. Configure o SMTP no arquivo .env.`
        );
    }

    return value;
}

export function loadSmtpConfig(): SmtpConfig {
    const user = readRequiredEnv('SMTP_USER');
    const pass = readRequiredEnv('SMTP_PASS');
    const host = readRequiredEnv('SMTP_HOST');
    const portValue = readRequiredEnv('SMTP_PORT');
    const port = Number(portValue);

    if (!Number.isInteger(port) || port <= 0) {
        throw new EmailConfigurationError('SMTP_PORT deve ser um número inteiro positivo.');
    }

    return {
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        user,
        pass,
        from: process.env.SMTP_FROM?.trim() || user,
        orcamentoRecipient: readRequiredEnv('ORCAMENTO_EMAIL_TO'),
    };
}
