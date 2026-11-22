const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'development-only-change-me'); next(); }
  catch { res.status(401).json({ error: 'Authentication required. Sign in and try again.' }); }
};
