const { verifySignedToken } = require('../utils/security');

const readBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
};

const requireAuthType = (expectedType) => (req, res, next) => {
  const token = readBearerToken(req);
  const payload = verifySignedToken(token);

  if (!payload || payload.type !== expectedType) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized request',
    });
  }

  req.auth = payload;
  next();
};

module.exports = {
  requireAdminAuth: requireAuthType('admin'),
  requireConductorAuth: requireAuthType('conductor'),
};
