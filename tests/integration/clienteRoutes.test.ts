import request from "supertest";
import app from "../../app";
import { getAuthToken } from "../Helper/getAuthToken";
import { connectDatabase, closeDatabase } from '../../src/config/database';

describe("Integração - Rotas de Clientes", () => {
let _token: string;
let db: any;

beforeAll(async () => {
  db = await connectDatabase();
  _token = await getAuthToken();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await db.collection('Clientes').deleteMany({});
});


  test("deve retornar 400 quando dados obrigatórios estiverem ausentes", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        Nome: "Cliente Teste",
        Email: "teste@email.com"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Nome, Email, Cpf e Telefone são obrigatórios"
    });
  });

  test("deve criar cliente com sucesso", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        Nome: "Ruann Godinho",
        Email: "ruann@email.com",
        Cpf: "092.912.010-81",
        Telefone: "11999999999"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      Nome: "Ruann Godinho",
      Email: "ruann@email.com",
      Cpf: "092.912.010-81"
    });
  });

  test("deve buscar cliente por CPF", async () => {
    const createResponse = await request(app)
      .post("/api/clientes")
      .send({
        Nome: "Cliente CPF",
        Email: "cpf@email.com",
        Cpf: "111.444.777-35",
        Telefone: "11988887777"
      })
      .auth(_token, { type: 'bearer' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.Cpf).toBe("111.444.777-35");

    const response = await request(app)
      .get("/api/clientes/cpf/111.444.777-35")
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      Nome: "Cliente CPF",
      Email: "cpf@email.com",
      Cpf: "111.444.777-35"
    });
  });

  test("deve rejeitar CPF inválido", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        Nome: "Cliente Inválido",
        Email: "invalido@email.com",
        Cpf: "00000000000",
        Telefone: "11999999999"
      })
      .auth(_token, { type: 'bearer' });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("CPF inválido");
  });

  test("deve listar clientes", async () => {
    const response = await request(app).get("/api/clientes").auth(_token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("deve buscar cliente por id inexistente", async () => {
    const response = await request(app).get("/api/clientes/id-inexistente").auth(_token, { type: 'bearer' });

    expect([400, 500]).toContain(response.status);
  });

  test("deve atualizar cliente inexistente", async () => {
    const response = await request(app)
      .put("/api/clientes/:id")
      .send({
        Nome: "Novo Nome"
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