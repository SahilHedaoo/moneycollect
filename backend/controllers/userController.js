const db = require('../models/db');
const jwt = require('jsonwebtoken');

exports.addUser = (req, res) => {
  const { name, phone, location, shop_name, frequency } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const bankId = decoded.bankId;

  db.query(
    'INSERT INTO users (bank_id, name, phone, location, shop_name, frequency) VALUES (?, ?, ?, ?, ?, ?)',
    [bankId, name, phone, location, shop_name, frequency],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'User added successfully' });
    }
  );
};


exports.getUsers = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const bankId = decoded.bankId;

  db.query(
    'SELECT * FROM users WHERE bank_id = ?',
    [bankId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json(results);
    }
  );
};


exports.deleteUser = (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  console.log('Received Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //  MUST match login secret

    
  console.log('Decoded Token:', decoded); // 🪵 Check this

  
    const bankId = decoded.bankId; //  MUST match token field

    db.query(
      'DELETE FROM users WHERE id = ? AND bank_id = ?',
      [userId, bankId],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) {
          return res.status(403).json({ error: 'User not found or not owned by bank' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
      }
    );
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};


exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, phone, location, shop_name, frequency } = req.body;

  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const bankId = decoded.bankId;

  db.query(
    `UPDATE users
     SET name = ?, phone = ?, location = ?, shop_name = ?, frequency = ?
     WHERE id = ? AND bank_id = ?`,
    [name, phone, location, shop_name, frequency, id, bankId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json({ message: 'User updated successfully' });
    }
  );
};
