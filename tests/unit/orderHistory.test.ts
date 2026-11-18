import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { StatusOS } from '../../src/enterprise/value-objects/status-os.vo';
import { OrdemServicoMapper } from '../../src/Adapters/gateways/mappers/ordem-servico.mapper';

describe('order history', () => {
    const makeOrder = () => OrdemServico.create({
        cpfCnpj: '11144477735', veiculoId: new ObjectId().toString(),
    });

    test('persists status history through the mapper', () => {
        const order = makeOrder();
        order.transicionarStatus(StatusOS.from('EM DIAGNOSTICO'));
        const restored = OrdemServicoMapper.toDomain(OrdemServicoMapper.toPersistence(order));
        expect(restored.statusHistory.map(entry => entry.status)).toEqual(['RECEBIDA', 'EM DIAGNOSTICO']);
        expect(restored.statusHistory[1].enteredAt).toEqual(order.statusEnteredAt);
    });

});
