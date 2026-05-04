import Redis from "ioredis";
import config from "./index";
import { logger } from "./logger";

let redisClient: Redis | null = null;
let isRedisConnected = false;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,

    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  redisClient.on("connect", () => {
    logger.info("✅ Redis connected");
    isRedisConnected = true;
  });

  redisClient.on("error", (err) => {
    logger.warn(
      "⚠️ Redis error: Redis may not be running. Caching disabled.",
      err.message
    );
    isRedisConnected = false;
  });

  redisClient.on("close", () => {
    logger.warn("❌ Redis connection closed");
    isRedisConnected = false;
  });

  return redisClient;
}

// ✅ Connect Redis
export async function connectRedis(): Promise<void> {
  try {
    const client = getRedisClient();

    if (client.status !== "ready") {
      await client.connect();
    }
  } catch {
    isRedisConnected = false;
  }
}

// ✅ Disconnect Redis
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info("🧠 Redis disconnected");
    }
  } catch (err) {
    logger.error("❌ Redis disconnect error:", err);
  }
}

// ✅ Cache SET
export const setCache = async (
  key: string,
  value: any,
  ttl: number = 3600
) => {
  try {
    await connectRedis();

    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(value), "EX", ttl);
      logger.info(`[Redis] SET ${key}`);
    }
  } catch {}
};

// ✅ Cache GET
export const getCache = async (key: string) => {
  try {
    await connectRedis();

    if (isRedisConnected && redisClient) {
      const data = await redisClient.get(key);

      if (data) {
        logger.info(`[Redis] HIT ${key}`);
        return JSON.parse(data);
      } else {
        logger.info(`[Redis] MISS ${key}`);
        return null;
      }
    }
  } catch {}

  return null;
};

// ✅ Cache DELETE
export const deleteCache = async (key: string) => {
  try {
    await connectRedis();

    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
      logger.info(`[Redis] DELETE ${key}`);
    }
  } catch {}
};


export const deleteByPattern = async (pattern: string) => {
  try {
    await connectRedis();

    if (isRedisConnected && redisClient) {
      const keys = await redisClient.keys(pattern);

      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info(
          `[Redis] DELETE pattern ${pattern} (${keys.length})`
        );
      }
    }
  } catch {}
};

// ✅ Check Redis status
export const isRedisAlive = () => isRedisConnected;