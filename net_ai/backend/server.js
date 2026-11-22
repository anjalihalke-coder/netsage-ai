const fs = require('fs');
const path = require('path');
const express = require('express');
const authRoutes = require('./routes/auth');
const diagnosisRoutes = require('./routes/diagnoses');

function loadEnv() {
  const file = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !Object.hasOwn(process.env, match[1])) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadEnv();
const app = express();
const root = path.join(__dirname, '..');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(root, 'frontend')));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'NetSage AI' }));
app.use('/api/auth', authRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use((error, _req, res, _next) => res.status(error.status || 400).json({ error: error.message || 'Request failed.' }));
const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`NetSage AI running at http://localhost:${port}`));
