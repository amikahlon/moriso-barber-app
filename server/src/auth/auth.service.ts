import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { users } from '@prisma/client';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    birth_date: Date | null;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('המייל כבר קיים במערכת');

    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'שגיאה ביצירת משתמש');
    }

    const user = await this.prisma.users.create({
      data: {
        id: data.user.id,
        email: dto.email,
        full_name: dto.fullName,
        phone: dto.phone,
        role: 'customer',
        birth_date: dto.birthDate ? new Date(dto.birthDate) : null,
      },
    });

    const { data: sessionData, error: sessionError } =
      await this.supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (sessionError || !sessionData.session) {
      throw new UnauthorizedException('שגיאה ביצירת session');
    }

    return this.formatResponse(user, sessionData.session);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedException('מייל או סיסמה שגויים');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: data.user.id },
    });

    if (!user) throw new UnauthorizedException('משתמש לא נמצא');

    return this.formatResponse(user, data.session);
  }

  private formatResponse(
    user: users,
    session: { access_token: string; refresh_token: string },
  ): AuthResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        birth_date: user.birth_date,
      },
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    };
  }
}
