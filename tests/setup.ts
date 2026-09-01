// Setup file for Jest tests
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.AUTH_EMAIL = 'admin@email.com';
process.env.AUTH_PASSWORD = '123456';
process.env.PORT = '3000';

// Use a test database URI - this can be a local MongoDB instance or in-memory
process.env.MONGODB_URI = 'mongodb://localhost:27017/Node-Fiap-Test';

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';