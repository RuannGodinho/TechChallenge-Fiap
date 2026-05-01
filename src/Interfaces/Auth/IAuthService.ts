export interface IAuthService {
  login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }>;
  verifyToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }>;
}