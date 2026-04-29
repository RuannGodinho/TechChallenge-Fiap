import request from "supertest";
import app from "../../app";

describe("Integração - Rotas de Clientes", () => {
  test("deve retornar 400 quando dados obrigatórios estiverem ausentes", async () => {
    const response = await request(app)
      .post("/api/clientes")
      .send({
        Nome: "Cliente Teste",
        Email: "teste@email.com"
      });

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
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      Nome: "Ruann Godinho",
      Email: "ruann@email.com"
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
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("CPF inválido");
  });

  test("deve listar clientes", async () => {
    const response = await request(app).get("/api/clientes");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("deve buscar cliente por id inexistente", async () => {
    const response = await request(app).get("/api/clientes/id-inexistente");

    expect([400, 500]).toContain(response.status);
  });

  test("deve atualizar cliente inexistente", async () => {
    const response = await request(app)
      .put("/api/clientes/:id")
      .send({
        Nome: "Novo Nome"
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "ID do cliente é obrigatório"
    });
  });

  test("deve deletar cliente inexistente", async () => {
    const response = await request(app).delete("/api/clientes/:id");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "ID do cliente é obrigatório"
    });
  });
});