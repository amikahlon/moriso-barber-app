import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: PrismaService.withSafePoolDefaults(process.env.DATABASE_URL),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.$executeRaw`SET timezone = 'Asia/Jerusalem'`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private static withSafePoolDefaults(url?: string): string | undefined {
    if (!url) return url;

    try {
      const parsed = new URL(url);

      if (!parsed.searchParams.has('connection_limit')) {
        parsed.searchParams.set('connection_limit', '20');
      }

      if (!parsed.searchParams.has('pool_timeout')) {
        parsed.searchParams.set('pool_timeout', '30');
      }

      return parsed.toString();
    } catch {
      return url;
    }
  }
}
