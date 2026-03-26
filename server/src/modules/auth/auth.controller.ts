import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('login')
  async login(@Payload() data: { email: string; pass: string }) {
    return this.authService.login(data.email, data.pass);
  }

  @MessagePattern('loginWithGoogle')
  async loginWithGoogle(@Payload() data: { token: string }) {
    return this.authService.loginWithGoogle(data.token);
  }
}
