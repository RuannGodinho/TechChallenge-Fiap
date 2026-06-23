import { ObjectId } from 'mongodb';
import { connectDatabase } from '../../src/infrastructure/database';
import { ClienteMongoGateway } from '../../src/Adapters/gateways/cliente.mongo.gateway';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { Email } from '../../src/enterprise/value-objects/email.vo';
import { Documento } from '../../src/enterprise/value-objects/documento.vo';
import { PecaMongoGateway } from '../../src/Adapters/gateways/peca.mongo.gateway';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { TipoItem } from '../../src/validators/tipo-item';
import { EstoqueMongoGateway } from '../../src/Adapters/gateways/estoque.mongo.gateway';
import { MovimentacaoEstoqueMongoGateway } from '../../src/Adapters/gateways/movimentacao-estoque.mongo.gateway';
import { Estoque } from '../../src/enterprise/entities/estoque.entity';
import { PecaId } from '../../src/enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../src/enterprise/value-objects/quantidade.vo';
import { MovimentacaoEstoque } from '../../src/enterprise/entities/movimentacao-estoque.entity';
import { TipoMovimentacao } from '../../src/enterprise/value-objects/tipo-movimentacao.vo';
import { OrigemMovimentacao } from '../../src/enterprise/value-objects/origem-movimentacao.vo';
import { OrdemServicoMongoGateway } from '../../src/Adapters/gateways/ordem-servico.mongo.gateway';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { StatusOS } from '../../src/enterprise/value-objects/status-os.vo';
import { OrcamentoMongoGateway } from '../../src/Adapters/gateways/orcamento.mongo.gateway';
import { Orcamento } from '../../src/enterprise/entities/orcamento.entity';
import { ServicoMongoGateway } from '../../src/Adapters/gateways/servico.mongo.gateway';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { VeiculoMongoGateway } from '../../src/Adapters/gateways/veiculo.mongo.gateway';
import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { Placa } from '../../src/enterprise/value-objects/placa.vo';

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

  describe('PecaMongoGateway', () => {
    test('should list pecas and use Pecas collection', async () => {
      const raw = {
        _id: new ObjectId(),
        nome: 'Peca',
        descricao: 'Descricao',
        tipo: 'PECA',
        preco: 100,
      };
      const collection = createCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([raw]) }),
      });
      const db = createDb(collection) as any;

      const gateway = new PecaMongoGateway(db);
      const pecas = await gateway.findAll();

      expect(pecas).toHaveLength(1);
      expect(pecas[0].nome).toBe('Peca');
      expect(collection.find).toHaveBeenCalled();
    });

    test('should find peca by id', async () => {
      const raw = {
        _id: new ObjectId(),
        nome: 'Peca',
        descricao: 'Descricao',
        tipo: 'PECA',
        preco: 100,
      };
      const collection = createCollection({ findOne: jest.fn().mockResolvedValue(raw) });
      const db = createDb(collection) as any;
      const gateway = new PecaMongoGateway(db);

      const byId = await gateway.findById(raw._id.toString());

      expect(byId?.nome).toBe('Peca');
      expect(collection.findOne).toHaveBeenCalled();
    });

    test('should create, update and delete peca', async () => {
      const insertedId = new ObjectId();
      const collection = createCollection({
        insertOne: jest.fn().mockResolvedValue({ insertedId }),
        findOneAndUpdate: jest.fn().mockResolvedValue({
          _id: insertedId,
          nome: 'Peca',
          descricao: 'Desc',
          tipo: 'PECA',
          preco: 100,
        }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      const db = createDb(collection) as any;
      const gateway = new PecaMongoGateway(db);
      const peca = new Peca('Peca', 'Desc', 100, TipoItem.PECA);

      await gateway.save(peca);
      expect(collection.insertOne).toHaveBeenCalled();

      await gateway.update(insertedId.toString(), peca);
      expect(collection.findOneAndUpdate).toHaveBeenCalled();

      await gateway.delete(insertedId.toString());
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: insertedId });
    });
  });

  describe('ServicoMongoGateway', () => {
    test('should list servicos and use Servicos collection', async () => {
      const raw = {
        _id: new ObjectId(),
        nome: 'Serviço',
        descricao: 'Descrição',
        preco: 100,
      };
      const collection = createCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([raw]) }),
      });
      const db = createDb(collection) as any;

      const gateway = new ServicoMongoGateway(db);
      const servicos = await gateway.findAll();

      expect(servicos).toHaveLength(1);
      expect(servicos[0].nome).toBe('Serviço');
      expect(collection.find).toHaveBeenCalled();
    });

    test('should find servico by id', async () => {
      const raw = {
        _id: new ObjectId(),
        nome: 'Serviço',
        descricao: 'Descrição',
        preco: 100,
      };
      const collection = createCollection({ findOne: jest.fn().mockResolvedValue(raw) });
      const db = createDb(collection) as any;
      const gateway = new ServicoMongoGateway(db);

      const byId = await gateway.findById(raw._id.toString());

      expect(byId?.nome).toBe('Serviço');
      expect(collection.findOne).toHaveBeenCalled();
    });

    test('should create, update and delete servico', async () => {
      const insertedId = new ObjectId();
      const collection = createCollection({
        insertOne: jest.fn().mockResolvedValue({ insertedId }),
        findOneAndUpdate: jest.fn().mockResolvedValue({
          _id: insertedId,
          nome: 'S',
          descricao: 'D',
          preco: 100,
        }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      const db = createDb(collection) as any;
      const gateway = new ServicoMongoGateway(db);
      const servico = new Servico('S', 'D', 100);

      await gateway.save(servico);
      expect(collection.insertOne).toHaveBeenCalled();

      await gateway.update(insertedId.toString(), servico);
      expect(collection.findOneAndUpdate).toHaveBeenCalled();

      await gateway.delete(insertedId.toString());
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: insertedId });
    });
  });

  describe('VeiculoMongoGateway', () => {
    test('should list veiculos and use Veiculos collection', async () => {
      const raw = {
        _id: new ObjectId(),
        placa: 'ABC1234',
        modelo: 'Civic',
        ano: 2022,
        marca: 'Honda',
      };
      const collection = createCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([raw]) }),
      });
      const db = createDb(collection) as any;

      const gateway = new VeiculoMongoGateway(db);
      const veiculos = await gateway.findAll();

      expect(veiculos).toHaveLength(1);
      expect(veiculos[0].placa.value).toBe('ABC1234');
      expect(collection.find).toHaveBeenCalled();
    });

    test('should find veiculo by id and placa', async () => {
      const raw = {
        _id: new ObjectId(),
        placa: 'ABC1234',
        modelo: 'Civic',
        ano: 2022,
        marca: 'Honda',
      };
      const collection = createCollection({ findOne: jest.fn().mockResolvedValue(raw) });
      const db = createDb(collection) as any;
      const gateway = new VeiculoMongoGateway(db);

      const byId = await gateway.findById(raw._id.toString());
      const byPlaca = await gateway.findByPlaca(Placa.from('ABC1234'));

      expect(byId?.modelo).toBe('Civic');
      expect(byPlaca?.modelo).toBe('Civic');
      expect(collection.findOne).toHaveBeenCalledTimes(2);
    });

    test('should create, update and delete veiculo', async () => {
      const insertedId = new ObjectId();
      const collection = createCollection({
        insertOne: jest.fn().mockResolvedValue({ insertedId }),
        findOneAndUpdate: jest.fn().mockResolvedValue({
          _id: insertedId,
          placa: 'ABC1234',
          modelo: 'Civic',
          ano: 2022,
          marca: 'Honda',
        }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      const db = createDb(collection) as any;
      const gateway = new VeiculoMongoGateway(db);
      const veiculo = new Veiculo(Placa.from('ABC1234'), 'Civic', 2022, 'Honda');

      await gateway.save(veiculo);
      expect(collection.insertOne).toHaveBeenCalled();

      await gateway.update(insertedId.toString(), veiculo);
      expect(collection.findOneAndUpdate).toHaveBeenCalled();

      await gateway.delete(insertedId.toString());
      expect(collection.deleteOne).toHaveBeenCalledWith({ _id: insertedId });
    });
  });

  describe('EstoqueMongoGateway', () => {
    test('should list and fetch estoque by peca id', async () => {
      const pecaObjectId = new ObjectId();
      const estoque = { pecaId: pecaObjectId, quantidade: 10 };
      const collection = createCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([estoque]) }),
        findOne: jest.fn().mockResolvedValue(estoque),
      });
      const db = createDb(collection);
      const gateway = new EstoqueMongoGateway(db as any);

      const all = await gateway.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].quantidade.value).toBe(10);

      const found = await gateway.findByPecaId(pecaObjectId.toString());
      expect(found?.quantidade.value).toBe(10);
      expect(collection.findOne).toHaveBeenCalledWith({ pecaId: pecaObjectId });
    });

    test('should insert and update estoque', async () => {
      const collection = createCollection({
        findOne: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ pecaId: new ObjectId(), quantidade: 5 }),
      });
      const db = createDb(collection);
      const gateway = new EstoqueMongoGateway(db as any);
      const pecaId = PecaId.from(new ObjectId().toString());

      await gateway.save(Estoque.restore(pecaId, Quantidade.from(5)));
      expect(collection.insertOne).toHaveBeenCalled();

      await gateway.save(Estoque.restore(pecaId, Quantidade.from(20)));
      expect(collection.updateOne).toHaveBeenCalledWith(
        { pecaId: new ObjectId(pecaId.value) },
        { $set: { quantidade: 20 } }
      );
    });
  });

  describe('MovimentacaoEstoqueMongoGateway', () => {
    test('should create movimentacao and list movimentacoes', async () => {
      const pecaId = PecaId.from(new ObjectId().toString());
      const movimentacao = new MovimentacaoEstoque(
        pecaId,
        TipoMovimentacao.from('ENTRADA'),
        Quantidade.from(5),
        new Date(),
        OrigemMovimentacao.from('compra')
      );
      const collection = createCollection({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              pecaId: new ObjectId(pecaId.value),
              tipo: 'ENTRADA',
              quantidade: 5,
              data: new Date(),
              origem: 'compra',
            },
          ]),
        }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId() }),
      });
      const db = createDb(collection);
      const gateway = new MovimentacaoEstoqueMongoGateway(db as any);

      await gateway.save(movimentacao);
      expect(collection.insertOne).toHaveBeenCalled();

      const all = await gateway.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].tipo.value).toBe('ENTRADA');
    });
  });

  describe('OrdemServicoMongoGateway', () => {
    test('should create and list ordens', async () => {
      const collection = createCollection({
        find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
        insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId() }),
      });
      const db = createDb(collection);
      const gateway = new OrdemServicoMongoGateway(db as any);
      const ordem = OrdemServico.create({
        cpfCnpj: '11144477735',
        veiculoId: new ObjectId().toString(),
      });

      await gateway.save(ordem);
      expect(collection.insertOne).toHaveBeenCalled();

      await gateway.findAll();
      expect(collection.find).toHaveBeenCalled();
    });

    test('should update ordemServico and return result', async () => {
      const updated = {
        _id: new ObjectId(),
        cpfCnpj: '11144477735',
        veiculo: new ObjectId(),
        status: 'EM DIAGNOSTICO',
        dataAbertura: new Date(),
        pecas: [],
        servicos: [],
      };
      const collection = createCollection({
        findOneAndUpdate: jest.fn().mockResolvedValue(updated),
      });
      const db = createDb(collection);
      const gateway = new OrdemServicoMongoGateway(db as any);
      const id = new ObjectId().toString();

      const result = await gateway.update(id, {
        status: StatusOS.from('EM DIAGNOSTICO'),
      } as Partial<OrdemServico>);

      expect(result?.status.value).toBe('EM DIAGNOSTICO');
      expect(collection.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('OrcamentoMongoGateway', () => {
    test('should save orcamento and get by id', async () => {
      const insertedId = new ObjectId();
      const collection = createCollection({
        insertOne: jest.fn().mockResolvedValue({ insertedId }),
        findOne: jest.fn().mockResolvedValue({
          _id: insertedId,
          ordemServicoId: new ObjectId(),
          versao: 1,
          status: 'PENDENTE',
          pecas: [],
          itensServicos: [],
          valorTotal: 100,
          validadeEm: new Date(),
          criadoEm: new Date(),
        }),
      });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);

      const gateway = new OrcamentoMongoGateway(createDb(collection) as any);
      const orcamento = Orcamento.createPendente({
        ordemServicoId: new ObjectId().toString(),
        pecas: [],
        servicos: [],
        valorTotal: 100,
      });

      const saved = await gateway.save(orcamento);
      expect(saved.id).toBe(insertedId.toString());
      await expect(gateway.findById(insertedId.toString())).resolves.toEqual(
        expect.objectContaining({ status: expect.objectContaining({ value: 'PENDENTE' }) })
      );
    });

    test('should update orcamento and return result', async () => {
      const id = new ObjectId();
      const ordemServicoId = new ObjectId();
      const result = {
        _id: id,
        ordemServicoId,
        versao: 2,
        status: 'APROVADO',
        pecas: [],
        itensServicos: [],
        valorTotal: 100,
        validadeEm: new Date(),
        criadoEm: new Date(),
      };
      const collection = createCollection({ findOneAndUpdate: jest.fn().mockResolvedValue(result) });
      mockedConnectDatabase.mockResolvedValue(createDb(collection) as any);
      const gateway = new OrcamentoMongoGateway(createDb(collection) as any);
      const orcamento = Orcamento.restore({
        id: id.toString(),
        ordemServicoId: ordemServicoId.toString(),
        versao: 2,
        status: 'APROVADO',
        pecas: [],
        itensServicos: [],
        valorTotal: 100,
        validadeEm: new Date(),
        criadoEm: new Date(),
      });

      await expect(gateway.update(id.toString(), orcamento)).resolves.toEqual(
        expect.objectContaining({ status: expect.objectContaining({ value: 'APROVADO' }) })
      );
      expect(collection.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
