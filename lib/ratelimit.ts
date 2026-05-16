/**
 * Rate limiting distribué via Upstash Redis.
 * Fallback automatique sur un limiteur in-memory si les variables Upstash ne sont pas configurées.
 *
 * Variables d'environnement requises pour Upstash :
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

// ── Types ────────────────────────────────────────────────────────────────────

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // timestamp ms
}

// ── Fallback in-memory (redémarrage Vercel = reset, acceptable en dernier recours) ──

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, reset: entry.resetAt };
}

// ── Upstash Redis limiter ────────────────────────────────────────────────────

let upstashLimiter: import('@upstash/ratelimit').Ratelimit | null = null;

async function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    upstashLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: false,
      prefix: 'ksm:ratelimit',
    });
    return upstashLimiter;
  } catch {
    return null;
  }
}

// ── Interface publique ───────────────────────────────────────────────────────

/**
 * Vérifie le rate limit pour une clé donnée (généralement l'IP).
 * Utilise Upstash Redis si configuré, sinon fallback in-memory.
 *
 * @param key       Identifiant unique (IP, userId…)
 * @param max       Nombre de requêtes max (utilisé pour le fallback uniquement)
 * @param windowMs  Fenêtre en ms (utilisé pour le fallback uniquement)
 */
export async function checkRateLimit(
  key: string,
  max = 5,
  windowMs = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const limiter = await getUpstashLimiter();

  if (limiter) {
    const result = await limiter.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return inMemoryLimit(key, max, windowMs);
}

/** Extrait l'IP réelle depuis les headers Vercel / proxies. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
