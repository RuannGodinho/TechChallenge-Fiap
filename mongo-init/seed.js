db = db.getSiblingDB("Node-Fiap");

/* =========================
   SERVICOS
========================= */
db.Servicos.insertMany([
  {
    Nome: "Troca de óleo",
    Descricao: "Troca de óleo do motor",
    Preco: 100
  },
  {
    Nome: "Alinhamento",
    Descricao: "Alinhamento de direção e suspensão",
    Preco: 120
  },
  {
    Nome: "Balanceamento",
    Descricao: "Balanceamento das rodas",
    Preco: 80
  },
  {
    Nome: "Revisão completa",
    Descricao: "Revisão geral preventiva do veículo",
    Preco: 350
  },
  {
    Nome: "Troca de bateria",
    Descricao: "Substituição da bateria automotiva",
    Preco: 90
  },
  {
    Nome: "Troca de pastilha de freio",
    Descricao: "Substituição das pastilhas dianteiras",
    Preco: 180
  }
]);

/* =========================
   CLIENTES
========================= */
db.Clientes.insertMany([
  {
    Nome: "Ruann Godinho",
    Email: "ruann@gmail.com",
    Cpf: "81788455045",
    Telefone: "15997653816"
  },
  {
    Nome: "Maria Silva",
    Email: "maria@gmail.com",
    Cpf: "81421981009",
    Telefone: "11988887777"
  },
  {
    Nome: "Carlos Souza",
    Email: "carlos@gmail.com",
    Cpf: "20004874080",
    Telefone: "21999996666"
  },
  {
    Nome: "Fernanda Lima",
    Email: "fernanda@gmail.com",
    Cpf: "17281988010",
    Telefone: "31977774444"
  },
  {
    Nome: "João Pereira",
    Email: "joao@gmail.com",
    Cpf: "52263606068",
    Telefone: "11995553322"
  }
]);

/* =========================
   VEICULOS
========================= */
db.Veiculos.insertMany([
  {
    Placa: "DXQ1J39",
    Modelo: "Astra",
    Ano: 2003,
    Marca: "Chevrolet"
  },
  {
    Placa: "BRA2E19",
    Modelo: "Civic",
    Ano: 2012,
    Marca: "Honda"
  },
  {
    Placa: "MER4T88",
    Modelo: "Corolla",
    Ano: 2018,
    Marca: "Toyota"
  },
  {
    Placa: "QWE7P10",
    Modelo: "Gol",
    Ano: 2010,
    Marca: "Volkswagen"
  },
  {
    Placa: "XYZ9K21",
    Modelo: "Onix",
    Ano: 2021,
    Marca: "Chevrolet"
  }
]);

/* =========================
   PECAS
========================= */
db.Pecas.insertMany([
  {
    Nome: "Óleo",
    Descricao: "Óleo do motor",
    Tipo: "INSUMO",
    Preco: 150.00
  },
  {
    Nome: "Filtro de óleo",
    Descricao: "Filtro lubrificante do motor",
    Tipo: "PECA",
    Preco: 35.00
  },
  {
    Nome: "Pastilha de Freio",
    Descricao: "Pastilha de freio dianteira",
    Tipo: "PECA",
    Preco: 50.00
  },
  {
    Nome: "Disco de Freio",
    Descricao: "Disco de freio ventilado",
    Tipo: "PECA",
    Preco: 220.00
  },
  {
    Nome: "Fluido de Freio",
    Descricao: "Fluido hidráulico DOT4",
    Tipo: "INSUMO",
    Preco: 45.00
  },
  {
    Nome: "Bateria 60Ah",
    Descricao: "Bateria automotiva 12V",
    Tipo: "PECA",
    Preco: 420.00
  },
  {
    Nome: "Aditivo Radiador",
    Descricao: "Aditivo para sistema de arrefecimento",
    Tipo: "INSUMO",
    Preco: 38.00
  }
]);