const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// VULNERABLE: SQL Injection - string concatenation instead of parameterized query
router.get('/search', (req, res) => {
  const userInput = req.query.name;
  const query = "SELECT * FROM users WHERE full_name = '" + userInput + "'";
  // This is intentionally vulnerable for demo purposes
  res.json({ query: query, message: "This endpoint is vulnerable to SQL Injection" });
});

// VULNERABLE: Hardcoded credentials
const DB_PASSWORD = "SuperSecret123!";
const API_KEY = "sk-1234567890abcdef";

// VULNERABLE: XSS - reflecting user input without sanitization
router.get('/greet', (req, res) => {
  const name = req.query.name;
  res.send("<h1>Hello " + name + "</h1>");
});

// VULNERABLE: Path traversal
const fs = require('fs');
const path = require('path');
router.get('/file', (req, res) => {
  const filename = req.query.name;
  const content = fs.readFileSync('/uploads/' + filename, 'utf8');
  res.send(content);
});

// VULNERABLE: Insecure random for token generation
router.get('/token', (req, res) => {
  const token = Math.random().toString(36).substring(2);
  res.json({ token: token });
});

// VULNERABLE: eval usage
router.post('/calculate', (req, res) => {
  const expression = req.body.expression;
  const result = eval(expression);
  res.json({ result: result });
});

module.exports = router;
