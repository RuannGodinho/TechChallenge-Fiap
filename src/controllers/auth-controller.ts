import { IAuthService } from '../Interfaces/Auth/auth-service.interface';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    return this.authService.login(email, password);
  }
}