import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Service Orders API",
      version: "1.0.0",
      description: "Sistema de gestão de oficina mecânica"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["./src/infrastructure/http/cliente-routes.ts", "./src/infrastructure/http/veiculo-routes.ts", "./src/infrastructure/http/auth-routes.ts", "./src/infrastructure/http/ordem-servico-routes.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);