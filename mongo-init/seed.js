const { MongoClient } = require('mongodb');

// Seed only Service Orders-owned collections. Safe to run repeatedly.
async function runSeed() {
  const client = new MongoClient(process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/Node-Fiap');
  try {
    await client.connect();
    const db = client.db();
    const customers = [
      { nome: 'Ruann Godinho', email: 'ruann@gmail.com', cpf: '81788455045', telefone: '15997653816', status: 'ATIVO' },
      { nome: 'Maria Silva', email: 'maria@gmail.com', cpf: '81421981009', telefone: '11988887777', status: 'ATIVO' },
      { nome: 'João Pereira', email: 'joao@gmail.com', cpf: '52263606068', telefone: '11995553322', status: 'INATIVO' },
    ];
    const vehicles = [
      { placa: 'DXQ1J39', modelo: 'Astra', ano: 2003, marca: 'Chevrolet' },
      { placa: 'BRA2E19', modelo: 'Civic', ano: 2012, marca: 'Honda' },
    ];
    for (const customer of customers) {
      await db.collection('Clientes').updateOne({ cpf: customer.cpf }, { $setOnInsert: customer }, { upsert: true });
    }
    for (const vehicle of vehicles) {
      await db.collection('Veiculos').updateOne({ placa: vehicle.placa }, { $setOnInsert: vehicle }, { upsert: true });
    }
    const savedVehicles = await Promise.all(vehicles.map(v => db.collection('Veiculos').findOne({ placa: v.placa })));
    for (let i = 0; i < savedVehicles.length; i++) {
      const dataAbertura = new Date('2026-01-10T11:00:00Z');
      await db.collection('OrdemServico').updateOne(
        { cpfCnpj: customers[i].cpf, veiculo: savedVehicles[i]._id },
        { $setOnInsert: { cpfCnpj: customers[i].cpf, veiculo: savedVehicles[i]._id, status: 'RECEBIDA', dataAbertura, statusEnteredAt: dataAbertura, statusHistory: [{ status: 'RECEBIDA', enteredAt: dataAbertura }], pecas: [], servicos: [] } },
        { upsert: true },
      );
    }
  } finally {
    await client.close();
  }
}
runSeed().catch(error => { console.error('Seed failed:', error); process.exitCode = 1; });
