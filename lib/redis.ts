import { Redis } from '@upstash/redis'

// Check if Redis environment variables are set
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize Redis if both URL and token are provided
export const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

// Helper function to check if Redis is available
export function isRedisAvailable(): boolean {
  return redis !== null;
}