const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'retail-bi-secret-key-2026';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireSuper(req, res, next) {
  if (req.user.role !== 'super') {
    return res.status(403).json({ error: 'Super user access required' });
  }
  next();
}

module.exports = { authenticate, requireSuper, JWT_SECRET };
