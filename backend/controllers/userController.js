const db = require('../models/db');
const jwt = require('jsonwebtoken');

exports.addUser = (req, res) => {
  const { first_name, last_name, dial_code, phone, email, package_name, package_amount } = req.body;

  if (!first_name || !last_name ||!dial_code || !phone || !package_name || !package_amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

    db.query(
      `INSERT INTO users (bank_id, first_name, last_name, dial_code, phone, email, package_name, package_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bankId, first_name, last_name, dial_code, phone, email || null, package_name, package_amount],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ message: 'User added successfully' });
      }
    );
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

exports.getUsers = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
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
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

exports.deleteUser = (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

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
  const { first_name, last_name, dial_code, phone, email, package_name, package_amount } = req.body;

  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

    db.query(
      `UPDATE users
       SET first_name = ?, last_name = ?,  dial_code = ?, phone = ?, email = ?, package_name = ?, package_amount = ?
       WHERE id = ? AND bank_id = ?`,
      [first_name, last_name,  dial_code, phone, email || null, package_name, package_amount, id, bankId],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ message: 'User updated successfully' });
      }
    );
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

exports.updateDialCode = (req, res) => {
  const { dial_code } = req.body;
  console.log('Received updateDialCode request:', { dial_code });

  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;
    console.log('Decoded token:', { bankId });

    db.query(
      `UPDATE users SET dial_code = ? WHERE bank_id = ?`,
      [dial_code, bankId],
      (err, result) => {
        console.log("result", result);
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error occurred', details: err.message });
        }
        console.log('Database update result:', { affectedRows: result.affectedRows });
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'No users found for this bank ID' });
        }
        res.status(200).json({
          message: 'Dial codes updated successfully',
          affectedRows: result.affectedRows,
        });
      }
    );
  } catch (err) {
    console.error('Token error:', err);
    return res.status(403).json({ error: 'Invalid token', details: err.message });
  }
};
