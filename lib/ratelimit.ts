import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis environment variables are set
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize ratelimit if Redis is available
export const ratelimit = redisUrl && redisToken
  ? new Ratelimit({
      redis: new Redis({
        url: redisUrl,
        token: redisToken,
      }), 
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
    })
  : null;

// Helper function to check if ratelimit is available
export function isRatelimitAvailable(): boolean {
  return ratelimit !== null;
}
