const { MongoClient, ObjectId } = require('mongodb');

async function runSeed() {
  const url =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/Node-Fiap';

  const client = new MongoClient(url);

  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conectado com sucesso.');

    const db = client.db('Node-Fiap');

    const alreadySeeded = (await db.collection('Servicos').countDocuments()) > 0;
    if (alreadySeeded) {
      console.log('Seed ja aplicado, pulando.');
      return;
    }

    console.log('Inserindo Serviços...');
    const servicosResult = await db.collection('Servicos').insertMany([
      { nome: 'Troca de óleo', descricao: 'Troca de óleo do motor', preco: 100 },
      { nome: 'Alinhamento', descricao: 'Alinhamento de direção e suspensão', preco: 120 },
      { nome: 'Balanceamento', descricao: 'Balanceamento das rodas', preco: 80 },
      { nome: 'Revisão completa', descricao: 'Revisão geral preventiva do veículo', preco: 350 },
      { nome: 'Troca de bateria', descricao: 'Substituição da bateria automotiva', preco: 90 },
      { nome: 'Troca de pastilha de freio', descricao: 'Substituição das pastilhas dianteiras', preco: 180 },
    ]);
    const servicoIds = Object.values(servicosResult.insertedIds);

    console.log('Inserindo Clientes...');
    await db.collection('Clientes').insertMany([
      { nome: 'Ruann Godinho', email: 'ruann@gmail.com', cpf: '81788455045', telefone: '15997653816' },
      { nome: 'Maria Silva', email: 'maria@gmail.com', cpf: '81421981009', telefone: '11988887777' },
      { nome: 'Carlos Souza', email: 'carlos@gmail.com', cpf: '20004874080', telefone: '21999996666' },
      { nome: 'Fernanda Lima', email: 'fernanda@gmail.com', cpf: '17281988010', telefone: '31977774444' },
      { nome: 'João Pereira', email: 'joao@gmail.com', cpf: '52263606068', telefone: '11995553322' },
    ]);

    console.log('Inserindo Veículos...');
    const veiculosResult = await db.collection('Veiculos').insertMany([
      { placa: 'DXQ1J39', modelo: 'Astra', ano: 2003, marca: 'Chevrolet' },
      { placa: 'BRA2E19', modelo: 'Civic', ano: 2012, marca: 'Honda' },
      { placa: 'MER4T88', modelo: 'Corolla', ano: 2018, marca: 'Toyota' },
      { placa: 'QWE7P10', modelo: 'Gol', ano: 2010, marca: 'Volkswagen' },
      { placa: 'XYZ9K21', modelo: 'Onix', ano: 2021, marca: 'Chevrolet' },
    ]);
    const veiculoIds = Object.values(veiculosResult.insertedIds);

    console.log('Inserindo Peças...');
    const pecasResult = await db.collection('Pecas').insertMany([
      { nome: 'Óleo', descricao: 'Óleo do motor', tipo: 'INSUMO', preco: 150.0 },
      { nome: 'Filtro de óleo', descricao: 'Filtro lubrificante do motor', tipo: 'PECA', preco: 35.0 },
      { nome: 'Pastilha de Freio', descricao: 'Pastilha de freio dianteira', tipo: 'PECA', preco: 50.0 },
      { nome: 'Disco de Freio', descricao: 'Disco de freio ventilado', tipo: 'PECA', preco: 220.0 },
      { nome: 'Fluido de Freio', descricao: 'Fluido hidráulico DOT4', tipo: 'INSUMO', preco: 45.0 },
      { nome: 'Bateria 60Ah', descricao: 'Bateria automotiva 12V', tipo: 'PECA', preco: 420.0 },
      { nome: 'Aditivo Radiador', descricao: 'Aditivo para sistema de arrefecimento', tipo: 'INSUMO', preco: 38.0 },
    ]);
    const pecaIds = Object.values(pecasResult.insertedIds);

    console.log('Inserindo Estoque...');
    await db.collection('Estoque').insertMany([
      { pecaId: pecaIds[0], quantidade: 40 },
      { pecaId: pecaIds[1], quantidade: 25 },
      { pecaId: pecaIds[2], quantidade: 18 },
      { pecaId: pecaIds[3], quantidade: 10 },
      { pecaId: pecaIds[4], quantidade: 30 },
      { pecaId: pecaIds[5], quantidade: 8 },
      { pecaId: pecaIds[6], quantidade: 15 },
    ]);

    console.log('Inserindo Ordens de Serviço...');
    await db.collection('OrdemServico').insertMany([
      {
        cpfCnpj: '81788455045',
        veiculo: veiculoIds[0],
        status: 'EM EXECUCAO',
        dataAbertura: new Date('2026-01-02T10:00:00Z'),
        pecas: [
          { pecaId: pecaIds[0], quantidade: 1, valorUnitario: 150.0 },
          { pecaId: pecaIds[1], quantidade: 1, valorUnitario: 35.0 },
        ],
        servicos: [servicoIds[0]],
        valorTotal: 285.0,
      },
      {
        cpfCnpj: '81421981009',
        veiculo: veiculoIds[1],
        status: 'AGUARDANDO APROVACAO',
        dataAbertura: new Date('2026-01-05T14:30:00Z'),
        pecas: [],
        servicos: [servicoIds[1], servicoIds[2]],
        valorTotal: 200.0,
      },
      {
        cpfCnpj: '20004874080',
        veiculo: veiculoIds[2],
        status: 'EM DIAGNOSTICO',
        dataAbertura: new Date('2026-01-08T09:15:00Z'),
        pecas: [
          { pecaId: pecaIds[4], quantidade: 1, valorUnitario: 45.0 },
        ],
        servicos: [servicoIds[3]],
        valorTotal: 395.0,
      },
      {
        cpfCnpj: '17281988010',
        veiculo: veiculoIds[3],
        status: 'RECEBIDA',
        dataAbertura: new Date('2026-01-10T11:00:00Z'),
        pecas: [
          { pecaId: pecaIds[5], quantidade: 1, valorUnitario: 420.0 },
        ],
        servicos: [servicoIds[4]],
        valorTotal: 510.0,
      },
      {
        cpfCnpj: '52263606068',
        veiculo: veiculoIds[4],
        status: 'RECEBIDA',
        dataAbertura: new Date('2026-01-03T08:45:00Z'),
        pecas: [
          { pecaId: pecaIds[2], quantidade: 2, valorUnitario: 50.0 },
          { pecaId: pecaIds[3], quantidade: 2, valorUnitario: 220.0 },
        ],
        servicos: [servicoIds[5]],
        valorTotal: 720.0,
      },
      {
        cpfCnpj: '81788455045',
        veiculo: veiculoIds[0],
        status: 'FINALIZADA',
        dataAbertura: new Date('2025-12-15T16:00:00Z'),
        pecas: [
          { pecaId: pecaIds[6], quantidade: 1, valorUnitario: 38.0 },
        ],
        servicos: [servicoIds[0]],
        valorTotal: 188.0,
      },
    ]);

    console.log('Seed finalizado com sucesso.');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Conexao encerrada.');
    process.exit(0);
  }
}

runSeed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
