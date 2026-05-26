const buckets = new Map()

function resolveClientKey(req) {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  return req.auth?.payload?.sub || req.ip || req.socket?.remoteAddress || 'unknown'
}

function createRateLimiter({ windowMs, max, message, prefix }) {
  return (req, res, next) => {
    const now = Date.now()
    const key = `${prefix}:${resolveClientKey(req)}`
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      })
      return next()
    }

    if (bucket.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({
        ok: false,
        message
      })
    }

    bucket.count += 1
    return next()
  }
}

module.exports = {
  createRateLimiter
}
