import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Oficina",
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
  apis: ["./src/infrastructure/http/*.ts", "./src/Adapters/controllers/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);