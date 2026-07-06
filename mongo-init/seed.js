const { MongoClient } = require('mongodb');

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
    await db.collection('Servicos').insertMany([
      { nome: 'Troca de óleo', descricao: 'Troca de óleo do motor', preco: 100 },
      { nome: 'Alinhamento', descricao: 'Alinhamento de direção e suspensão', preco: 120 },
      { nome: 'Balanceamento', descricao: 'Balanceamento das rodas', preco: 80 },
      { nome: 'Revisão completa', descricao: 'Revisão geral preventiva do veículo', preco: 350 },
      { nome: 'Troca de bateria', descricao: 'Substituição da bateria automotiva', preco: 90 },
      { nome: 'Troca de pastilha de freio', descricao: 'Substituição das pastilhas dianteiras', preco: 180 },
    ]);

    console.log('Inserindo Clientes...');
    await db.collection('Clientes').insertMany([
      { nome: 'Ruann Godinho', email: 'ruann@gmail.com', cpf: '81788455045', telefone: '15997653816' },
      { nome: 'Maria Silva', email: 'maria@gmail.com', cpf: '81421981009', telefone: '11988887777' },
      { nome: 'Carlos Souza', email: 'carlos@gmail.com', cpf: '20004874080', telefone: '21999996666' },
      { nome: 'Fernanda Lima', email: 'fernanda@gmail.com', cpf: '17281988010', telefone: '31977774444' },
      { nome: 'João Pereira', email: 'joao@gmail.com', cpf: '52263606068', telefone: '11995553322' },
    ]);

    console.log('Inserindo Veículos...');
    await db.collection('Veiculos').insertMany([
      { placa: 'DXQ1J39', modelo: 'Astra', ano: 2003, marca: 'Chevrolet' },
      { placa: 'BRA2E19', modelo: 'Civic', ano: 2012, marca: 'Honda' },
      { placa: 'MER4T88', modelo: 'Corolla', ano: 2018, marca: 'Toyota' },
      { placa: 'QWE7P10', modelo: 'Gol', ano: 2010, marca: 'Volkswagen' },
      { placa: 'XYZ9K21', modelo: 'Onix', ano: 2021, marca: 'Chevrolet' },
    ]);

    console.log('Inserindo Peças...');
    await db.collection('Pecas').insertMany([
      { nome: 'Óleo', descricao: 'Óleo do motor', tipo: 'INSUMO', preco: 150.0 },
      { nome: 'Filtro de óleo', descricao: 'Filtro lubrificante do motor', tipo: 'PECA', preco: 35.0 },
      { nome: 'Pastilha de Freio', descricao: 'Pastilha de freio dianteira', tipo: 'PECA', preco: 50.0 },
      { nome: 'Disco de Freio', descricao: 'Disco de freio ventilado', tipo: 'PECA', preco: 220.0 },
      { nome: 'Fluido de Freio', descricao: 'Fluido hidráulico DOT4', tipo: 'INSUMO', preco: 45.0 },
      { nome: 'Bateria 60Ah', descricao: 'Bateria automotiva 12V', tipo: 'PECA', preco: 420.0 },
      { nome: 'Aditivo Radiador', descricao: 'Aditivo para sistema de arrefecimento', tipo: 'INSUMO', preco: 38.0 },
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
