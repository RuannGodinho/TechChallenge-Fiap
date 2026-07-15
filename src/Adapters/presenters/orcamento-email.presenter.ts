import { OrcamentoEmailPayload } from '../../application/ports/email.port';

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export class OrcamentoEmailPresenter {
    buildSubject(_payload: OrcamentoEmailPayload): string {
        return 'Orçamento pendente';
    }

    buildBody(payload: OrcamentoEmailPayload): string {
        const pecasLines = payload.pecas.length
            ? payload.pecas
                  .map(
                      (peca) =>
                          `- ${peca.nome} (${peca.quantidade}x) - ${formatCurrency(peca.preco * peca.quantidade)}`
                  )
                  .join('\n')
            : '- Nenhuma peça';

        const servicosLines = payload.servicos.length
            ? payload.servicos
                  .map((servico) => `- ${servico.nome} - ${formatCurrency(servico.preco)}`)
                  .join('\n')
            : '- Nenhum serviço';

        return [
            'Olá!',
            '',
            'Um novo orçamento foi gerado.',
            '',
            `Versão do orçamento: ${payload.versao}`,
            `Valor total: ${formatCurrency(payload.valorTotal)}`,
            `Validade: ${payload.validadeEm.toLocaleString('pt-BR')}`,
            '',
            'Peças:',
            pecasLines,
            '',
            'Serviços:',
            servicosLines,
            '',
            'Aguardamos sua aprovação.',
            '',
            'Node-Fiap - Oficina',
        ].join('\n');
    }
}
