const buckets = new Map();

const createRateLimit = ({ windowMs, maxRequests }) => (req, res, next) => {
  const key = `${req.ip}:${req.originalUrl}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return next();
  }

  if (bucket.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }

  bucket.count += 1;
  next();
};

module.exports = {
  createRateLimit,
};
