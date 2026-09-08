import nodemailer from 'nodemailer';
import { EmailDeliveryError } from '../../src/application/errors/email.errors';
import { NodemailerEmailAdapter } from '../../src/Adapters/adapters/nodemailer-email.adapter';
import { SmtpConfig } from '../../src/config/smtp';

jest.mock('nodemailer');

describe('NodemailerEmailAdapter', () => {
    const smtpConfig: SmtpConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: 'sender@example.com',
        pass: 'secret',
        from: 'oficina@example.com',
        orcamentoRecipient: 'cliente@exemplo.com',
    };

    const payload = {
        ordemServicoId: 'ordem-1',
        orcamentoId: 'orcamento-1',
        versao: 1,
        valorTotal: 190,
        validadeEm: new Date('2026-01-20T00:00:00Z'),
        pecas: [],
        servicos: [{ nome: 'Alinhamento', preco: 110 }],
    };

    test('deve enviar email para destinatario configurado', async () => {
        const sendMail = jest.fn().mockResolvedValue({ messageId: '1' });
        (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

        const adapter = new NodemailerEmailAdapter(smtpConfig);
        await adapter.sendOrcamentoPendente(payload);

        expect(sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'oficina@example.com',
                to: 'cliente@exemplo.com',
                subject: 'Orçamento pendente',
            })
        );
    });

    test('deve lançar EmailDeliveryError quando SMTP falhar', async () => {
        const sendMail = jest.fn().mockRejectedValue(new Error('connection refused'));
        (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

        const adapter = new NodemailerEmailAdapter(smtpConfig);

        await expect(adapter.sendOrcamentoPendente(payload)).rejects.toThrow(EmailDeliveryError);
        await expect(adapter.sendOrcamentoPendente(payload)).rejects.toThrow(
            'Falha ao enviar o orçamento por e-mail'
        );
    });
});
