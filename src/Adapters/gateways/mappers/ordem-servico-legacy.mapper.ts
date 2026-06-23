import { ObjectId } from 'mongodb';
import { OrdemServico as LegacyOrdemServico } from '../../../Entities/ordem-servico';
import { OrdemPecaItem as LegacyOrdemPecaItem } from '../../../ValueObjects/ordem-peca-item';
import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { Documento } from '../../../enterprise/value-objects/documento.vo';
import { VeiculoId } from '../../../enterprise/value-objects/veiculo-id.vo';
import { StatusOS } from '../../../enterprise/value-objects/status-os.vo';
import { OrdemPecaItem } from '../../../enterprise/value-objects/ordem-peca-item.vo';

export class OrdemServicoLegacyMapper {
    static fromLegacy(legacy: LegacyOrdemServico): OrdemServico {
        return OrdemServico.restore({
            id: legacy._id?.toString(),
            cpfCnpj: legacy.cpfCnpj,
            veiculoId: legacy.veiculo.toString(),
            status: legacy.status,
            dataAbertura: legacy.dataAbertura,
            pecas: (legacy.pecas ?? []).map((item) => ({
                pecaId: item.pecaId.toString(),
                quantidade: item.quantidade,
                valorUnitario: item.valorUnitario,
            })),
            servicos: (legacy.servicos ?? []).map((servicoId) => servicoId.toString()),
            valorTotal: legacy.valorTotal,
        });
    }

    static toLegacy(ordem: OrdemServico): LegacyOrdemServico {
        const legacy = new LegacyOrdemServico(
            ordem.cpfCnpj.value,
            new ObjectId(ordem.veiculoId.value),
            ordem.status.value as LegacyOrdemServico['status'],
            ordem.dataAbertura,
            ordem.pecas.map(
                (item) =>
                    new LegacyOrdemPecaItem(
                        new ObjectId(item.pecaId.value),
                        item.quantidade,
                        item.valorUnitario
                    )
            ),
            ordem.servicos.map((servicoId) => new ObjectId(servicoId))
        );

        if (ordem.id) {
            legacy._id = new ObjectId(ordem.id);
        }

        if (ordem.valorTotal != null) {
            legacy.valorTotal = ordem.valorTotal;
        }

        return legacy;
    }

    static partialToDomain(updates: Partial<LegacyOrdemServico>): Partial<OrdemServico> {
        const domain: Partial<OrdemServico> = {};

        if (updates.cpfCnpj) {
            domain.cpfCnpj = Documento.from(updates.cpfCnpj as string);
        }

        if (updates.veiculo) {
            domain.veiculoId = VeiculoId.from(updates.veiculo.toString());
        }

        if (updates.status) {
            domain.status = StatusOS.from(updates.status);
        }

        if (updates.dataAbertura) {
            domain.dataAbertura = updates.dataAbertura;
        }

        if (updates.valorTotal != null) {
            domain.valorTotal = updates.valorTotal;
        }

        if (updates.pecas) {
            domain.pecas = updates.pecas.map((item) =>
                OrdemPecaItem.restore(
                    item.pecaId.toString(),
                    item.quantidade,
                    item.valorUnitario
                )
            );
        }

        if (updates.servicos) {
            domain.servicos = OrdemServico.dedupeServicos(
                updates.servicos.map((servicoId) => servicoId.toString())
            );
        }

        return domain;
    }
}
