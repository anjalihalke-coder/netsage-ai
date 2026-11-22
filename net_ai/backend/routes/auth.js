const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { read, write } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();
const hash = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');

router.post('/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ error: 'Name, valid email, and password (at least 8 characters) are required.' });
  const users = read('users.json');
  if (users.some(user => user.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' });
  const salt = crypto.randomBytes(16).toString('hex');
  const user = { id: crypto.randomUUID(), name, email, salt, passwordHash: hash(password, salt), role: users.length === 0 ? 'reviewer' : 'engineer' };
  users.push(user); write('users.json', users);
  res.status(201).json({ token: jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'development-only-change-me', { expiresIn: '12h' }), user: { id: user.id, name, email, role: user.role } });
});

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = read('users.json').find(item => item.email === email);
  if (!user || hash(String(req.body.password || ''), user.salt) !== user.passwordHash) return res.status(401).json({ error: 'Email or password is incorrect.' });
  res.json({ token: jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'development-only-change-me', { expiresIn: '12h' }), user: { id: user.id, name: user.name, email, role: user.role } });
});
router.get('/me', auth, (req, res) => {
  const user = read('users.json').find(item => item.id === req.user.sub);
  if (!user) return res.status(401).json({ error: 'Account not found.' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});
module.exports = router;
