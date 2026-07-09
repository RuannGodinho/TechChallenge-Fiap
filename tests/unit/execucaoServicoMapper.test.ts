import { ObjectId } from 'mongodb';
import { ExecucaoServicoMapper } from '../../src/Adapters/gateways/mappers/execucao-servico.mapper';
import { ExecucaoServico } from '../../src/enterprise/entities/execucao-servico.entity';

describe('ExecucaoServicoMapper', () => {
    const ordemServicoId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    test('deve converter domínio para persistência e voltar', () => {
        const execucao = ExecucaoServico.restore({
            id: new ObjectId().toString(),
            ordemServicoId,
            servicoId,
            status: 'FINALIZADO',
            criadoEm: new Date('2024-01-01'),
            iniciadoEm: new Date('2024-01-01T10:00:00'),
            finalizadoEm: new Date('2024-01-01T11:00:00'),
        });

        const persistence = ExecucaoServicoMapper.toPersistence(execucao);
        const domain = ExecucaoServicoMapper.toDomain({
            _id: new ObjectId(execucao.id),
            ordemServicoId,
            servicoId,
            status: persistence.status,
            criadoEm: persistence.criadoEm,
            iniciadoEm: persistence.iniciadoEm,
            finalizadoEm: persistence.finalizadoEm,
        });

        expect(domain.status.value).toBe('FINALIZADO');
        expect(domain.iniciadoEm).toEqual(execucao.iniciadoEm);
    });

    test('deve aceitar ids como string na persistência', () => {
        const domain = ExecucaoServicoMapper.toDomain({
            ordemServicoId,
            servicoId,
            status: 'PENDENTE',
            criadoEm: new Date(),
        });

        expect(domain.ordemServicoId).toBe(ordemServicoId);
        expect(domain.servicoId).toBe(servicoId);
    });
});
