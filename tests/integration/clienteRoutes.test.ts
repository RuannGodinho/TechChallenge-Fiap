import request from "supertest";
import { ObjectId } from 'mongodb';
import { getAuthToken } from "../Helper/getAuthToken";

const clientesStore = new Map<string, any>();

jest.mock('../../src/Repository/cliente-repository', () => ({
  ClienteRepository: jest.fn().mockImplementation(() => ({
    getAllClientes: jest.fn(async () => Array.from(clientesStore.values())),
    getClienteById: jest.fn(async (id: string | ObjectId) => {
      const key = id instanceof ObjectId ? id.toString() : id.toString();
      return clientesStore.get(key) || null;
    }),
    getClienteByCpf: jest.fn(async (cpf: string) => {
      return Array.from(clientesStore.values()).find((cliente) => cliente.cpf === cpf) || null;
    }),
    criarCliente: jest.fn(async (cliente: any) => {
      const id = new ObjectId().toString();
      clientesStore.set(id, { ...cliente, _id: id });
    }),
    atualizarCliente: jest.fn(async (id: string, cliente: any) => {
      const key = id.toString();
      const existing = clientesStore.get(key);
      if (!existing) return;
      clientesStore.set(key, { ...existing, ...cliente, _id: key });
    }),
    deletarCliente: jest.fn(async (id: string) => {
      return clientesStore.delete(id.toString());
    }),
  })),
}));

import app from "../../app";

describe("Integração - Rotas de Clientes", () => {
  let _token: string;

  beforeAll(async () => {
    _token = await getAuthToken();
  });

  afterEach(() => {
    clientesStore.clear();
    jest.clearAllMocks();
  });

  test("deve retornar 400 quando dados obrigatórios estiverem ausentes", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        nome: "Cliente Teste",
        email: "teste@email.com"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "nome, email, cpf/cnpj e telefone são obrigatórios"
    });
  });

  test("deve criar cliente com sucesso", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        nome: "Ruann Godinho",
        email: "ruann@email.com",
        cpf: "092.912.010-81",
        telefone: "11999999999"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      nome: "Ruann Godinho",
      email: "ruann@email.com",
      cpf: "092.912.010-81"
    });
  });

  test("deve buscar cliente por CPF", async () => {
    const createResponse = await request(app)
      .post("/api/clientes")
      .send({
        nome: "Cliente CPF",
        email: "cpf@email.com",
        cpf: "111.444.777-35",
        telefone: "11988887777"
      })
      .auth(_token, { type: 'bearer' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.cpf).toBe("111.444.777-35");

    const response = await request(app)
      .get("/api/clientes/cpf/111.444.777-35")
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      nome: "Cliente CPF",
      email: "cpf@email.com",
      cpf: "111.444.777-35"
    });
  });

  test("deve rejeitar CPF inválido", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        nome: "Cliente Inválido",
        email: "invalido@email.com",
        cpf: "00000000000",
        telefone: "11999999999"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("Erro ao criar cliente:CPF/CNPJ inválido");
  });

  test("deve listar clientes", async () => {
    const response = await request(app).get("/api/clientes").auth(_token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("deve buscar cliente por id inexistente", async () => {
    const response = await request(app).get("/api/clientes/id-inexistente").auth(_token, { type: 'bearer' });

    expect([400, 404, 500]).toContain(response.status);
  });

  test("deve atualizar cliente inexistente", async () => {
    const response = await request(app)
      .put("/api/clientes/:id")
      .send({
        nome: "Novo Nome"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "ID do cliente é obrigatório"
    });
  });

  test("deve deletar cliente inexistente", async () => {
    const response = await request(app).delete("/api/clientes/:id").auth(_token, { type: 'bearer' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "ID do cliente é obrigatório"
    });
  });
});