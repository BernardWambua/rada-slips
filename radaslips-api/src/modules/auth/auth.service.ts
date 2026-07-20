import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../core/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.tipster.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const tipster = await this.prisma.tipster.create({
      data: {
        phoneNumber: dto.phoneNumber,
        passwordHash,
        displayName: dto.displayName,
        wallet: { create: {} },
      },
      select: {
        id: true,
        phoneNumber: true,
        displayName: true,
        status: true,
        createdAt: true,
      },
    });

    const accessToken = await this.signToken(tipster.id);
    return { tipster, accessToken };
  }

  async login(dto: LoginDto) {
    const tipster = await this.prisma.tipster.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!tipster) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, tipster.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (tipster.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const accessToken = await this.signToken(tipster.id);
    return {
      tipster: {
        id: tipster.id,
        phoneNumber: tipster.phoneNumber,
        displayName: tipster.displayName,
        status: tipster.status,
        createdAt: tipster.createdAt,
      },
      accessToken,
    };
  }

  async me(tipsterId: string) {
    const tipster = await this.prisma.tipster.findUniqueOrThrow({
      where: { id: tipsterId },
      select: {
        id: true,
        phoneNumber: true,
        displayName: true,
        status: true,
        createdAt: true,
        wallet: {
          select: {
            availableFunds: true,
            escrowFunds: true,
          },
        },
      },
    });

    return tipster;
  }

  private signToken(tipsterId: string) {
    return this.jwtService.signAsync({ sub: tipsterId });
  }
}
