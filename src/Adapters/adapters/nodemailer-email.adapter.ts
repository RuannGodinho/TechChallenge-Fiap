import nodemailer, { Transporter } from 'nodemailer';
import { EmailDeliveryError } from '../../application/errors/email.errors';
import { IEmailPort, OrcamentoEmailPayload } from '../../application/ports/email.port';
import { SmtpConfig } from '../../config/smtp';
import { logger } from '../../infrastructure/logging/logger';
import { OrcamentoEmailPresenter } from '../presenters/orcamento-email.presenter';

export class NodemailerEmailAdapter implements IEmailPort {
    private transporter: Transporter | null = null;

    constructor(
        private readonly smtpConfig: SmtpConfig,
        private readonly presenter: OrcamentoEmailPresenter = new OrcamentoEmailPresenter()
    ) {}

    async sendOrcamentoPendente(payload: OrcamentoEmailPayload): Promise<void> {
        try {
            await this.getTransporter().sendMail({
                from: this.smtpConfig.from,
                to: this.smtpConfig.orcamentoRecipient,
                subject: this.presenter.buildSubject(payload),
                text: this.presenter.buildBody(payload),
            });
            logger.info({
                msg: 'smtp_sent',
                integration: 'smtp',
                host: this.smtpConfig.host,
                versao: payload.versao,
            });
        } catch (error: unknown) {
            const reason = error instanceof Error ? error.message : String(error);
            logger.error({
                err: error,
                msg: 'smtp_send_failed',
                integration: 'smtp',
                host: this.smtpConfig.host,
            });
            throw new EmailDeliveryError(
                `Falha ao enviar o orçamento por e-mail para o destinatário configurado em ORCAMENTO_EMAIL_TO: ${reason}`
            );
        }
    }

    private getTransporter(): Transporter {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: this.smtpConfig.host,
                port: this.smtpConfig.port,
                secure: this.smtpConfig.secure,
                auth: {
                    user: this.smtpConfig.user,
                    pass: this.smtpConfig.pass,
                },
            });
        }

        return this.transporter;
    }
}
