import {
    OrcamentoPecaResponseDto,
    OrcamentoResponseDto,
    OrcamentoServicoResponseDto,
} from '../../application/dtos/orcamento/orcamento.dtos';
import { Orcamento } from '../../enterprise/entities/orcamento.entity';
import { Peca } from '../../enterprise/entities/peca.entity';
import { Servico } from '../../enterprise/entities/servico.entity';

export class OrcamentoPresenter {
    present(orcamento: Orcamento): OrcamentoResponseDto {
        return {
            id: orcamento.id,
            ordemServicoId: orcamento.ordemServicoId,
            versao: orcamento.versao,
            status: orcamento.status.value,
            pecas: orcamento.pecas.map((peca) => this.presentPeca(peca)),
            itensServicos: orcamento.itensServicos.map((servico) => this.presentServico(servico)),
            valorTotal: orcamento.valorTotal,
            validadeEm: orcamento.validadeEm,
            criadoEm: orcamento.criadoEm,
        };
    }

    presentList(orcamentos: Orcamento[]): OrcamentoResponseDto[] {
        return orcamentos.map((orcamento) => this.present(orcamento));
    }

    private presentPeca(peca: Peca): OrcamentoPecaResponseDto {
        const response: OrcamentoPecaResponseDto = {
            nome: peca.nome,
            descricao: peca.descricao,
            tipo: peca.tipo,
            preco: peca.preco,
        };

        if (peca.id) {
            response.id = peca.id;
        }

        if (peca.quantidade != null) {
            response.quantidade = peca.quantidade;
        }

        return response;
    }

    private presentServico(servico: Servico): OrcamentoServicoResponseDto {
        const response: OrcamentoServicoResponseDto = {
            nome: servico.nome,
            descricao: servico.descricao,
            preco: servico.preco,
        };

        if (servico.id) {
            response.id = servico.id;
        }

        if (servico.quantidade != null) {
            response.quantidade = servico.quantidade;
        }

        return response;
    }
}
