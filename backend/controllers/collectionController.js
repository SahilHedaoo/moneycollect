const db = require('../models/db');
const jwt = require('jsonwebtoken');

// ✅ Add new collection for user
exports.addCollection = (req, res) => {
  const { user_id, amount, frequency } = req.body;

  db.query(
    'INSERT INTO collections (user_id, amount, frequency) VALUES (?, ?, ?)',
    [user_id, amount, frequency],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Collection added successfully' });
    }
  );
};

// ✅ Get total amount collected by user
exports.getTotalAmountByUser = (req, res) => {
  const { user_id } = req.params;

  db.query(
    'SELECT SUM(amount) AS total FROM collections WHERE user_id = ?',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json(results[0]);
    }
  );
};

// ✅ Get all collections for a specific user (optionally filtered by date range)
exports.getCollectionsByUser = (req, res) => {
  const { user_id } = req.params;
  const { start, end } = req.query;

  let query = 'SELECT * FROM collections WHERE user_id = ?';
let params = [user_id];

if (start && end) {
  query += ' AND DATE(collected_at) BETWEEN ? AND ?';
  params.push(start, end);
}
  query += ' ORDER BY collected_at DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });

  console.log("Final Query:", query);
console.log("Params:", params);

};


// ✅ Get summary collections (today, yesterday, etc.) by bank
exports.getSummaryByBank = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

    const queries = {
      today: `SELECT SUM(c.amount) as total FROM collections c 
              JOIN users u ON c.user_id = u.id 
              WHERE u.bank_id = ? AND DATE(c.collected_at) = CURDATE()`,

      yesterday: `SELECT SUM(c.amount) as total FROM collections c 
                  JOIN users u ON c.user_id = u.id 
                  WHERE u.bank_id = ? AND DATE(c.collected_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,

      week: `SELECT SUM(c.amount) as total FROM collections c 
             JOIN users u ON c.user_id = u.id 
             WHERE u.bank_id = ? AND YEARWEEK(c.collected_at, 1) = YEARWEEK(CURDATE(), 1)`,

      month: `SELECT SUM(c.amount) as total FROM collections c 
              JOIN users u ON c.user_id = u.id 
              WHERE u.bank_id = ? AND MONTH(c.collected_at) = MONTH(CURDATE()) 
              AND YEAR(c.collected_at) = YEAR(CURDATE())`,

      year: `SELECT SUM(c.amount) as total FROM collections c 
             JOIN users u ON c.user_id = u.id 
             WHERE u.bank_id = ? AND YEAR(c.collected_at) = YEAR(CURDATE())`,
    };

    const summary = {};
    let pending = Object.keys(queries).length;
    let hasError = false;

    for (const key in queries) {
      db.query(queries[key], [bankId], (err, results) => {
        if (hasError) return;
        if (err) {
          hasError = true;
          return res.status(500).json({ error: err });
        }
        summary[key] = results[0].total || 0;

        pending--;
        if (pending === 0) {
          return res.status(200).json(summary);
        }
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Invalid token' });
  }
};