import jwt, { Secret } from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { authMock } from '../config/auth';
import { IAuthService } from '../Interfaces/Auth/IAuthService';

interface IJwtPayload {
  userId: string;
  email: string;
}

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const isValidUser = email === authMock.email && password === authMock.password;

    if (!isValidUser) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    const payload: IJwtPayload = {
      userId: 'mock-user',
      email,
    };

    const token = jwt.sign(payload, jwtConfig.secret as Secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return { success: true, token };
  }

  async verifyToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret as Secret) as IJwtPayload;
      return { valid: true, userId: decoded.userId, email: decoded.email };
    } catch {
      return { valid: false, error: 'Token inválido' };
    }
  }
}

export function verifyToken(token: string): IJwtPayload {
  return jwt.verify(token, jwtConfig.secret as Secret) as IJwtPayload;
}