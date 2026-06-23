import {
    OrdemServicoDetalhesInput,
    OrdemServicoDetalhesResponseDto,
    OrdemServicoResponseDto,
} from '../../application/dtos/ordem-servico/ordem-servico.dtos';
import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';

export class OrdemServicoPresenter {

    present(ordem: OrdemServico): OrdemServicoResponseDto {
        const response: OrdemServicoResponseDto = {
            id: ordem.id,
            cpfCnpj: ordem.cpfCnpj.value,
            veiculoId: ordem.veiculoId.value,
            status: ordem.status.value,
            dataAbertura: ordem.dataAbertura,

            pecas: ordem.pecas.map((item) => ({
                pecaId: item.pecaId.value,
                quantidade: item.quantidade,
                valorUnitario: item.valorUnitario,
            })),
            servicos: ordem.servicos,
        };

        if (ordem.valorTotal != null) {
            response.valorTotal = ordem.valorTotal;
        }

        return response;
    }

    presentList(ordens: OrdemServico[]): OrdemServicoResponseDto[] {
        return ordens.map((ordem) => this.present(ordem));
    }

    presentDetalhes(input: OrdemServicoDetalhesInput): OrdemServicoDetalhesResponseDto {
        const response: OrdemServicoDetalhesResponseDto = {
            cpfCnpj: input.ordem.cpfCnpj.value,
            status: input.ordem.status.value,
            dataAbertura: input.ordem.dataAbertura,
            veiculo: input.veiculo
                ? {
                      placa: input.veiculo.placa.value,
                      modelo: input.veiculo.modelo,
                      ano: input.veiculo.ano,
                      marca: input.veiculo.marca,
                  }
                : null,
            pecas: input.pecas.map(({ item, peca }) => ({
                peca: {
                    nome: peca.nome,
                    descricao: peca.descricao,
                    preco: peca.preco,
                    tipo: peca.tipo,
                },
                quantidade: item.quantidade,
                valorUnitario: item.valorUnitario,
                subtotal: item.quantidade * item.valorUnitario,
            })),
            servicos: input.servicos.map((servico) => ({
                nome: servico.nome,
                descricao: servico.descricao,
                preco: servico.preco,
            })),
        };

        if (input.ordem.valorTotal != null) {
            response.valorTotal = input.ordem.valorTotal;
        }

        return response;
    }

    presentDetalhesList(inputs: OrdemServicoDetalhesInput[]): OrdemServicoDetalhesResponseDto[] {
        return inputs.map((input) => this.presentDetalhes(input));
    }
}
