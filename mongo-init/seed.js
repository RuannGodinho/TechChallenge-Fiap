db = db.getSiblingDB("Node-Fiap");

/* =========================
   SERVICOS
========================= */
db.Servicos.insertMany([
  {
    nome: "Troca de óleo",
    descricao: "Troca de óleo do motor",
    preco: 100
  },
  {
    nome: "Alinhamento",
    descricao: "Alinhamento de direção e suspensão",
    preco: 120
  },
  {
    nome: "Balanceamento",
    descricao: "Balanceamento das rodas",
    preco: 80
  },
  {
    nome: "Revisão completa",
    descricao: "Revisão geral preventiva do veículo",
    preco: 350
  },
  {
    nome: "Troca de bateria",
    descricao: "Substituição da bateria automotiva",
    preco: 90
  },
  {
    nome: "Troca de pastilha de freio",
    descricao: "Substituição das pastilhas dianteiras",
    preco: 180
  }
]);

/* =========================
   CLIENTES
========================= */
db.Clientes.insertMany([
  {
    nome: "Ruann Godinho",
    email: "ruann@gmail.com",
    cpf: "81788455045",
    telefone: "15997653816"
  },
  {
    nome: "Maria Silva",
    email: "maria@gmail.com",
    cpf: "81421981009",
    telefone: "11988887777"
  },
  {
    nome: "Carlos Souza",
    email: "carlos@gmail.com",
    cpf: "20004874080",
    telefone: "21999996666"
  },
  {
    nome: "Fernanda Lima",
    email: "fernanda@gmail.com",
    cpf: "17281988010",
    telefone: "31977774444"
  },
  {
    nome: "João Pereira",
    email: "joao@gmail.com",
    cpf: "52263606068",
    telefone: "11995553322"
  }
]);

/* =========================
   VEICULOS
========================= */
db.Veiculos.insertMany([
  {
    placa: "DXQ1J39",
    modelo: "Astra",
    ano: 2003,
    marca: "Chevrolet"
  },
  {
    placa: "BRA2E19",
    modelo: "Civic",
    ano: 2012,
    marca: "Honda"
  },
  {
    placa: "MER4T88",
    modelo: "Corolla",
    ano: 2018,
    marca: "Toyota"
  },
  {
    placa: "QWE7P10",
    modelo: "Gol",
    ano: 2010,
    marca: "Volkswagen"
  },
  {
    placa: "XYZ9K21",
    modelo: "Onix",
    ano: 2021,
    marca: "Chevrolet"
  }
]);

/* =========================
   PECAS
========================= */
db.Pecas.insertMany([
  {
    nome: "Óleo",
    descricao: "Óleo do motor",
    tipo: "INSUMO",
    preco: 150.00
  },
  {
    nome: "Filtro de óleo",
    descricao: "Filtro lubrificante do motor",
    tipo: "PECA",
    preco: 35.00
  },
  {
    nome: "Pastilha de Freio",
    descricao: "Pastilha de freio dianteira",
    tipo: "PECA",
    preco: 50.00
  },
  {
    nome: "Disco de Freio",
    descricao: "Disco de freio ventilado",
    tipo: "PECA",
    preco: 220.00
  },
  {
    nome: "Fluido de Freio",
    descricao: "Fluido hidráulico DOT4",
    tipo: "INSUMO",
    preco: 45.00
  },
  {
    nome: "Bateria 60Ah",
    descricao: "Bateria automotiva 12V",
    tipo: "PECA",
    preco: 420.00
  },
  {
    nome: "Aditivo Radiador",
    descricao: "Aditivo para sistema de arrefecimento",
    tipo: "INSUMO",
    preco: 38.00
  }
]);