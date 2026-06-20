import { ObjectId } from 'mongodb';
import { connectDatabase } from '../../src/infrastructure/database';
import { ClienteMongoGateway } from '../../src/Adapters/gateways/cliente.mongo.gateway';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { Email } from '../../src/enterprise/value-objects/email.vo';
import { Documento } from '../../src/enterprise/value-objects/documento.vo';
import { PecaRepository } from '../../src/Repository/peca-repository';
import { EstoqueRepository } from '../../src/Repository/estoque-repository';
import { MovimentacaoEstoqueRepository } from '../../src/Repository/movimentacao-estoque-repository';
import { OrdemServicoRepository } from '../../src/Repository/ordem-servico-repository';
import { OrcamentoRepository } from '../../src/Repository/orcamento-repository';
import { ServicoRepository } from '../../src/Repository/servico-repository';
import { VeiculoRepository } from '../../src/Repository/veiculo-repository';

jest.mock('../../src/infrastructure/database', () => ({
  connectDatabase: jest.fn(),
}));

const mockedConnectDatabase = connectDatabase as jest.MockedFunction<typeof connectDatabase>;

type CollectionStub = {
  find: jest.Mock;
  findOne: jest.Mock;
  insertOne: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
};

const createCollection = (overrides: Partial<CollectionStub> = {}): CollectionStub => ({
  find: overrides.find ?? jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
  findOne: overrides.findOne ?? jest.fn().mockResolvedValue(null),
  insertOne: overrides.insertOne ?? jest.fn().mockResolvedValue({}),
  updateOne: overrides.updateOne ?? jest.fn().mockResolvedValue({}),
  deleteOne: overrides.deleteOne ?? jest.fn().mockResolvedValue({}),
  findOneAndUpdate: overrides.findOneAndUpdate ?? jest.fn().mockResolvedValue(null),
});

const createDb = (collectionStub: any) => ({
  collection: jest.fn().mockReturnValue(collectionStub),
});

afterEach(() => {
  mockedConnectDatabase.mockReset();
  jest.clearAllMocks();
});

describe('Repository coverage', () => {
  describe('ClienteMongoGateway', () => {
    test('should list clientes and use Clientes collection', async () => {
      const raw = {
        _id: new ObjectId(),
        nome: 'Teste',
        email: 'a@test.com',
        cpf: '11144477735',
        telefone: '11999999999',
      };
      const collection = createCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([raw]) }),
      });
      const db = createDb(collection) as any;

      const gateway = new ClienteMongoGateway(db);
      const clientes = await gateway.findAll();

      expect(clientes).toHaveLength(1);
      expect(clientes[0].nome).toBe('Teste');
      expect(collection.find).toHaveBeenCalled();
    });

    test('should find cliente by id and documento', async () => {
      const raw = {
        _id: new ObjectId(),
        nome: 'Teste',
        email: 'a@test.com',
        cpf: '11144477735',
        telefone: '11999999999',
      };
      const collection = createCollection({ findOne: jest.fn().mockResolvedValue(raw) });
      const db = createDb(collection) as any;
      const gateway = new ClienteMongoGateway(db);

      const byId = await gateway.findById(raw._id.toString());
      const byDocumento = await gateway.findByDocumento(Documento.from('111.444.777-35'));

      expect(byId?.nome).toBe('Teste');
      expect(byDocumento?.nome).toBe('Teste');
      expect(collection.findOne).toHaveBeenCalledTimes(2);
    });

    test('should create, update and delete cliente', async () => {
      const insertedId = new ObjectId();
      const collection = createCollection({
        insertOne: jest.fn().mockResolvedValue({ insertedId }),
        findOneAndUpdate: jest.fn().mockResolvedValue({
          _id: insertedId,
          nome: 'A',
          email: 'a@test.com',
          cpf: '11144477735',
          telefone: '11999999999',
        }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      const db = createDb(collection) as any;
      const gateway = new ClienteMongoGateway(db);
      const cliente = new Cliente(
        'A',
        Email.from('a@test.com'),
        Documento.from('111.444.777-35'),
        '11999999999'
      );

      await gateway.save(cliente);
      expect(collection.insertOne).toHaveBeenCalled();

      await gateway.update(insertedId.toString(), cliente);
      expect(collection.findOneAndUpdate).toHaveBeenCalled();

      await gateway.delete(insertedId.toString());
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: insertedId });
    });
  });

  describe('PecaRepository', () => {
    test('should list pecas and manage by id', async () => {
      const id = new ObjectId();
      const expected = { _id: id };
      const collection = createCollection({ find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ nome: 'Peca' }]) }), findOne: jest.fn().mockResolvedValue(expected) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new PecaRepository();
      await expect(repository.getAllPecas()).resolves.toEqual([{ nome: 'Peca' }]);
      await expect(repository.getPecaById(id)).resolves.toEqual(expected);
      expect(collection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });

    test('should create, update and delete peca', async () => {
      const collection = createCollection();
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new PecaRepository();
      const peca = { nome: 'Peca', descricao: 'Desc', tipo: 'PECA', preco: 100 };
      await repository.createPeca(peca as any);
      expect(collection.insertOne).toHaveBeenCalledWith(peca);

      const id = new ObjectId();
      await repository.updatePeca(id, peca as any);
      expect(collection.updateOne).toHaveBeenCalledWith({ _id: new ObjectId(id) }, { $set: peca });

      await repository.deletePeca(id);
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });
  });

  describe('ServicoRepository', () => {
    test('should list and manage servico entities', async () => {
      const id = new ObjectId();
      const expected = { _id: id };
      const collection = createCollection({ find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ nome: 'Serviço' }]) }), findOne: jest.fn().mockResolvedValue(expected) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new ServicoRepository();
      await expect(repository.getAllServicos()).resolves.toEqual([{ nome: 'Serviço' }]);
      await expect(repository.getServicoById(id.toString())).resolves.toEqual(expected);
      expect(collection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });

    test('should create, update and delete servico', async () => {
      const collection = createCollection();
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);
      const repository = new ServicoRepository();
      const servico = { nome: 'S', descricao: 'D' };
      await repository.createServico(servico as any);
      expect(collection.insertOne).toHaveBeenCalledWith(servico);
      const id = new ObjectId().toString();
      await repository.updateServico(id, servico as any);
      expect(collection.updateOne).toHaveBeenCalledWith({ _id: new ObjectId(id) }, { $set: servico });
      await repository.deleteServico(id);
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });
  });

  describe('VeiculoRepository', () => {
    test('should list and manage veiculo entities', async () => {
      const id = new ObjectId();
      const expected = { _id: id };
      const collection = createCollection({ find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ placa: 'ABC1234' }]) }), findOne: jest.fn().mockResolvedValue(expected) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new VeiculoRepository();
      await expect(repository.getAllVeiculos()).resolves.toEqual([{ placa: 'ABC1234' }]);
      await expect(repository.getVeiculoById(id.toString())).resolves.toEqual(expected);
      expect(collection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });

    test('should create, update and delete veiculo', async () => {
      const collection = createCollection();
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);
      const repository = new VeiculoRepository();
      const veiculo = { placa: 'ABC1234', modelo: 'Modelo' };
      await repository.criarVeiculo(veiculo as any);
      expect(collection.insertOne).toHaveBeenCalledWith(veiculo);
      const id = new ObjectId().toString();
      await repository.atualizarVeiculo(id, veiculo as any);
      expect(collection.updateOne).toHaveBeenCalledWith({ _id: new ObjectId(id) }, { $set: veiculo });
      await repository.deletarVeiculo(id);
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });
  });

  describe('EstoqueRepository', () => {
    test('should list and fetch estoque by peca id', async () => {
      const estoque = { pecaId: new ObjectId(), quantidade: 10 };
      const collection = createCollection({ find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([estoque]) }), findOne: jest.fn().mockResolvedValue(estoque) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new EstoqueRepository();
      await expect(repository.getAllEstoque()).resolves.toEqual([estoque]);
      const id = new ObjectId();
      await expect(repository.getEstoqueByPecaId(id)).resolves.toEqual(estoque);
      expect(collection.findOne).toHaveBeenCalledWith({ pecaId: new ObjectId(id) });
    });

    test('should create, update and delete estoque', async () => {
      const collection = createCollection();
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);
      const repository = new EstoqueRepository();
      const estoque = { pecaId: new ObjectId(), quantidade: 5 };
      await repository.createEstoque(estoque as any);
      expect(collection.insertOne).toHaveBeenCalledWith(estoque);
      const id = new ObjectId();
      await repository.updateEstoque(id, 20);
      expect(collection.updateOne).toHaveBeenCalledWith({ pecaId: new ObjectId(id) }, { $set: { quantidade: 20 } });
      await repository.deleteEstoque(id);
      expect(collection.deleteOne).toHaveBeenCalledWith({ pecaId: id });
    });
  });

  describe('MovimentacaoEstoqueRepository', () => {
    test('should create movimentacao and list movimentacoes', async () => {
      const movimentacao = { pecaId: new ObjectId(), tipo: 'ENTRADA', quantidade: 5 };
      const collection = createCollection({ find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([movimentacao]) }) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new MovimentacaoEstoqueRepository();
      await repository.createMovimentacao(movimentacao as any);
      expect(collection.insertOne).toHaveBeenCalledWith(movimentacao);
      await expect(repository.listaMovimentacoes()).resolves.toEqual([movimentacao]);
    });
  });

  describe('OrdemServicoRepository', () => {
    test('should create and list ordens', async () => {
      const ordem = { descricao: 'Ordem' };
      const collection = createCollection({ find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([ordem]) }) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new OrdemServicoRepository();
      await repository.createOrdemServico(ordem as any);
      expect(collection.insertOne).toHaveBeenCalledWith(ordem);
      await expect(repository.listaOrdensServico()).resolves.toEqual([ordem]);
    });

    test('should update ordemServico and return result', async () => {
      const updated = { _id: new ObjectId(), status: 'EM DIAGNOSTICO' };
      const collection = createCollection({ findOneAndUpdate: jest.fn().mockResolvedValue(updated) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);
      const repository = new OrdemServicoRepository();
      const id = new ObjectId().toString();
      await expect(repository.updateOrdemServico(id, { status: 'EM DIAGNOSTICO' } as any)).resolves.toEqual(updated);
      expect(collection.findOneAndUpdate).toHaveBeenCalledWith({ _id: new ObjectId(id) }, { $set: { status: 'EM DIAGNOSTICO' } }, { returnDocument: 'after' });
    });
  });

  describe('OrcamentoRepository', () => {
    test('should create orcamento and get by id', async () => {
      const orcamento = { status: 'PENDENTE' };
      const collection = createCollection({ findOne: jest.fn().mockResolvedValue(orcamento) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const repository = new OrcamentoRepository();
      await repository.createOrcamento(orcamento as any);
      expect(collection.insertOne).toHaveBeenCalledWith(orcamento);
      const id = new ObjectId().toString();
      await expect(repository.getOrcamentoById(id)).resolves.toEqual(orcamento);
    });

    test('should update orcamento and return result', async () => {
      const result = { _id: new ObjectId(), status: 'APROVADO' };
      const collection = createCollection({ findOneAndUpdate: jest.fn().mockResolvedValue(result) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);
      const repository = new OrcamentoRepository();
      const id = new ObjectId().toString();
      await expect(repository.updateOrcamento(id, { status: 'APROVADO' } as any)).resolves.toEqual(result);
      expect(collection.findOneAndUpdate).toHaveBeenCalledWith({ _id: new ObjectId(id) }, { $set: { status: 'APROVADO' } }, { returnDocument: 'after' });
    });
  });
});
