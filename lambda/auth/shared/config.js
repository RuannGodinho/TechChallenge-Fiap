function getConfig() {
  return {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    authEmail: process.env.AUTH_EMAIL || 'admin@example.com',
    authPassword: process.env.AUTH_PASSWORD || 'admin123',
  };
}

module.exports = { getConfig };
