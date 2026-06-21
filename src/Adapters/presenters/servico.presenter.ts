import { ServicoResponseDto } from '../../application/dtos/servico/servico.dtos';
import { Servico } from '../../enterprise/entities/servico.entity';

export class ServicoPresenter {
    present(servico: Servico): ServicoResponseDto {
        return {
            id: servico.id,
            nome: servico.nome,
            descricao: servico.descricao,
            preco: servico.preco,
            quantidade: servico.quantidade,
        };
    }

    presentList(servicos: Servico[]): ServicoResponseDto[] {
        return servicos.map((servico) => this.present(servico));
    }
}
