import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { users } from '@prisma/client';

interface SupabaseJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
    });
  }

  async validate(payload: SupabaseJwtPayload): Promise<users> {
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('משתמש לא נמצא');

    return user;
  }
}
