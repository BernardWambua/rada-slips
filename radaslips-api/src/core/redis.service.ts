import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null = null;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('REDIS_URL not set — slip caching disabled');
      return;
    }

    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => null,
    });

    client.on('error', () => {
      // Suppress noisy reconnect logs when Redis is not running locally
    });

    client.connect().catch(() => {
      this.logger.warn('Redis unavailable — slip caching disabled');
    });

    this.client = client;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || this.client.status !== 'ready') return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;
    try {
      await this.client.setex(key, ttlSeconds, value);
    } catch {
      // Cache miss is acceptable on write failure
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || this.client.status !== 'ready') return;
    try {
      await this.client.del(key);
    } catch {
      // Ignore cache invalidation failures
    }
  }

  async onModuleDestroy() {
    if (this.client?.status === 'ready') {
      await this.client.quit();
    }
  }
}
