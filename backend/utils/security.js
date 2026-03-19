const crypto = require('crypto');

const HASH_PREFIX = 'scrypt';
const HASH_KEY_LENGTH = 64;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const TOKEN_SECRET = process.env.APP_SECRET || 'change-this-app-secret-in-env';

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
};

const secureCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, HASH_KEY_LENGTH).toString('hex');
  return `${HASH_PREFIX}$${salt}$${hash}`;
};

const isHashedPassword = (value) => typeof value === 'string' && value.startsWith(`${HASH_PREFIX}$`);

const verifyPassword = (password, storedValue) => {
  if (!storedValue) {
    return false;
  }

  if (!isHashedPassword(storedValue)) {
    return secureCompare(password, storedValue);
  }

  const [, salt, storedHash] = storedValue.split('$');
  const computedHash = crypto.scryptSync(password, salt, HASH_KEY_LENGTH).toString('hex');
  return secureCompare(computedHash, storedHash);
};

const createSignedToken = (payload, expiresInMs = TOKEN_TTL_MS) => {
  const body = {
    ...payload,
    exp: Date.now() + expiresInMs,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${encodedPayload}.${signature}`;
};

const verifySignedToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  if (!secureCompare(providedSignature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
};

module.exports = {
  createSignedToken,
  hashPassword,
  isHashedPassword,
  verifyPassword,
  verifySignedToken,
};
