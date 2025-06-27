const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

exports.registerBank = (req, res) => {
  const { name, email, password } = req.body;

  const passwordRegex = /^[a-zA-Z0-9]{6,10}$/;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Name is required' });
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ message: 'Valid email is required' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be 6–10 alphanumeric characters',
    });
  }

  db.query('SELECT * FROM banks WHERE email = ?', [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO banks (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        return res.status(201).json({ message: 'Bank registered successfully' });
      }
    );
  });
};


exports.loginBank = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM banks WHERE email = ?', [email], async (err, results) => {
    console.log("err", err);
    if (err || results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const bank = results[0];
    const match = await bcrypt.compare(password, bank.password);

    if (!match) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ bankId: bank.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ message: 'Login successful', token: token, id: bank.id });
  });
};


exports.getProfile = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // use the correct secret
    const bankId = decoded.bankId; // use correct field (matches login)

    db.query('SELECT id, name, email FROM banks WHERE id = ?', [bankId], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Bank not found' });
      res.status(200).json(results[0]);
    });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
