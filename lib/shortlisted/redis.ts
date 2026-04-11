import { Redis, type SetCommandOptions } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

export const redis = {
  get: <T = unknown>(key: string) => getRedis().get<T>(key),
  set: (key: string, value: unknown, opts?: SetCommandOptions) =>
    getRedis().set(key, value, opts),
};

export const SESSION_TTL = 60 * 60 * 48; // 48 hours in seconds
