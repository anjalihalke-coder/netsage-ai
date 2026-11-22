const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { read, write } = require('../db');
const { diagnose } = require('../ruleEngine');
const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => /\.(pkt|pka)$/i.test(file.originalname) ? cb(null, true) : cb(new Error('Only .pkt and .pka files are accepted.')) });

router.use(auth);
router.get('/', (_req, res) => res.json(read('diagnoses.json')));
router.post('/', (req, res) => {
  const { symptoms = '', topology = '', commandOutput = '' } = req.body || {};
  if (![symptoms, topology, commandOutput].some(value => String(value).trim())) return res.status(400).json({ error: 'Provide symptoms, topology, or command output.' });
  const record = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), submittedBy: req.user.sub, input: { symptoms, topology, commandOutput }, diagnosis: diagnose({ symptoms, topology, commandOutput }), review: { status: 'pending', reviewer: null, note: null } };
  const records = read('diagnoses.json'); records.unshift(record); write('diagnoses.json', records);
  res.status(201).json(record);
});
router.post('/upload', upload.single('packetTracer'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Select a .pkt or .pka file.' });
  res.status(201).json({ message: 'File received for reference. Packet Tracer contents are not parsed by this version.', filename: req.file.originalname });
});
router.patch('/:id/review', (req, res) => {
  if (req.user.role !== 'reviewer') return res.status(403).json({ error: 'Reviewer role required.' });
  const status = String(req.body.status || '');
  if (!['accepted', 'edited', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status must be accepted, edited, or rejected.' });
  const records = read('diagnoses.json');
  const record = records.find(item => item.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Diagnosis not found.' });
  if (status === 'edited' && req.body.diagnosis) record.diagnosis = { ...record.diagnosis, ...req.body.diagnosis };
  record.review = { status, reviewer: req.user.sub, note: String(req.body.note || '').slice(0, 1000), reviewedAt: new Date().toISOString() };
  write('diagnoses.json', records); res.json(record);
});
module.exports = router;
