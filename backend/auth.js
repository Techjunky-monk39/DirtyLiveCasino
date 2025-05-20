// Simple token-based admin authentication middleware
// Usage: app.use('/api/pitboss', require('./auth'))

const ADMIN_TOKEN = process.env.PITBOSS_ADMIN_TOKEN || 'changeme';

function pitbossAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden: Invalid admin token' });
  }
  next();
}

module.exports = pitbossAuth;
