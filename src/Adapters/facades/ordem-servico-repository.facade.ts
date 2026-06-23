import { ObjectId } from 'mongodb';
import { OrdemServico as LegacyOrdemServico } from '../../Entities/ordem-servico';
import { IOrdemServicoRepository } from '../../Interfaces/OrdemServico/ordem-servico-repository.interface';
import { IOrdemServicoGateway } from '../../application/ports/ordem-servico.gateway.port';
import { OrdemServicoLegacyMapper } from '../gateways/mappers/ordem-servico-legacy.mapper';

export class OrdemServicoRepositoryFacade implements IOrdemServicoRepository {
    constructor(private readonly gateway: IOrdemServicoGateway) {}

    async createOrdemServico(ordemServico: LegacyOrdemServico): Promise<void> {
        const domain = OrdemServicoLegacyMapper.fromLegacy(ordemServico);
        const saved = await this.gateway.save(domain);

        if (saved.id) {
            ordemServico._id = new ObjectId(saved.id);
        }
    }

    async listaOrdensServico(): Promise<LegacyOrdemServico[]> {
        const ordens = await this.gateway.findAll();
        return ordens.map((ordem) => OrdemServicoLegacyMapper.toLegacy(ordem));
    }

    async getOSById(id: string): Promise<LegacyOrdemServico | null> {
        const ordem = await this.gateway.findById(id);
        return ordem ? OrdemServicoLegacyMapper.toLegacy(ordem) : null;
    }

    async getOSByCpfCnpj(cpfCnpj: string): Promise<LegacyOrdemServico[]> {
        const ordens = await this.gateway.findByCpfCnpj(cpfCnpj);
        return ordens.map((ordem) => OrdemServicoLegacyMapper.toLegacy(ordem));
    }

    async updateOrdemServico(
        id: string,
        updates: Partial<LegacyOrdemServico>
    ): Promise<LegacyOrdemServico | null> {
        const domainUpdates = OrdemServicoLegacyMapper.partialToDomain(updates);
        const updated = await this.gateway.update(id, domainUpdates);
        return updated ? OrdemServicoLegacyMapper.toLegacy(updated) : null;
    }
}
