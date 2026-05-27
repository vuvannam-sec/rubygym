const crypto = require('crypto');
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/database');

const router = express.Router();

router.get('/search', async (req, res) => {
  const name = String(req.query.name || '').trim();

  if (!name) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  const [rows] = await pool.execute(
    'SELECT id, email, full_name, role FROM users WHERE full_name = ? LIMIT 20',
    [name]
  );

  return res.json({ results: rows });
});

router.get('/greet', (req, res) => {
  const name = String(req.query.name || 'guest').slice(0, 80);
  return res.json({ message: `Hello ${name}` });
});

router.get('/file', async (req, res) => {
  const filename = path.basename(String(req.query.name || ''));

  if (!filename) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  const uploadRoot = path.resolve(process.env.DEMO_UPLOAD_ROOT || path.join(__dirname, '..', '..', 'uploads'));
  const targetPath = path.resolve(uploadRoot, filename);

  if (!targetPath.startsWith(`${uploadRoot}${path.sep}`)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  try {
    const content = await fs.readFile(targetPath, 'utf8');
    return res.type('text/plain').send(content);
  } catch (error) {
    return res.status(404).json({ error: 'File not found' });
  }
});

router.get('/token', (req, res) => {
  return res.json({ token: crypto.randomBytes(32).toString('hex') });
});

router.post('/calculate', (req, res) => {
  const expression = String(req.body.expression || '').trim();
  const match = expression.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) {
    return res.status(400).json({ error: 'Only simple binary arithmetic is supported' });
  }

  const left = Number(match[1]);
  const operator = match[2];
  const right = Number(match[3]);

  if (operator === '/' && right === 0) {
    return res.status(400).json({ error: 'Division by zero is not allowed' });
  }

  const operations = {
    '+': left + right,
    '-': left - right,
    '*': left * right,
    '/': left / right
  };

  return res.json({ result: operations[operator] });
});

module.exports = router;
