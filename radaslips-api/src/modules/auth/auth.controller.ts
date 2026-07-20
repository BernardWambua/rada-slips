import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentTipster } from '../../core/decorators/current-tipster.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentTipster() tipster: { id: string }) {
    return this.authService.me(tipster.id);
  }
}
