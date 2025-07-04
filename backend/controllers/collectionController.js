const db = require('../models/db');
const jwt = require('jsonwebtoken');

exports.addCollection = (req, res) => {
  const { user_id, amount, frequency, collected_at } = req.body;
  
  const collectedAt = collected_at ? new Date(collected_at) : new Date();
  db.query(
    'INSERT INTO collections (bank_id, user_id, amount, frequency, collected_at) VALUES (?, ?, ?, ?, ?)',
    [req?.query?.user_id, user_id, amount, frequency, collectedAt],
    (err, result) => {
      console.error('DB Error:', err);
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Collection added successfully' });
    }
  );
};

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


exports.getFilteredCollections = (req, res) => {
  const { period } = req.params;
  const bankId = req.bankId;

  let dateCondition = '';
  switch (period) {
    case 'today':
      dateCondition = 'DATE(c.created_at) = CURDATE()';
      break;
    case 'yesterday':
      dateCondition = 'DATE(c.created_at) = CURDATE() - INTERVAL 1 DAY';
      break;
    case 'week':
      dateCondition = 'YEARWEEK(c.created_at, 1) = YEARWEEK(CURDATE(), 1)';
      break;
    case 'month':
      dateCondition = 'MONTH(c.created_at) = MONTH(CURDATE()) AND YEAR(c.created_at) = YEAR(CURDATE())';
      break;
    case 'year':
      dateCondition = 'YEAR(c.created_at) = YEAR(CURDATE())';
      break;
    default:
      return res.status(400).json({ message: 'Invalid period' });
  }

  const query = `
    SELECT u.first_name, u.last_name, c.amount, DATE(c.created_at) as date
    FROM collections c
    JOIN users u ON c.user_id = u.id
    WHERE ${dateCondition} AND u.bank_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(query, [bankId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
};

exports.getUser = (req, res) => {
  let query = 'SELECT * FROM users WHERE user_id = ?';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
};

exports.getCollections = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

    const query = `
      SELECT c.*, u.first_name, u.last_name 
      FROM collections c 
      JOIN users u ON c.user_id = u.id 
      WHERE u.bank_id = ? 
      ORDER BY c.collected_at DESC
    `;

    db.query(query, [bankId], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json(results);
    });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

exports.getCollectionsByDateRange = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { start, end } = req.query;

  if (!token) return res.status(401).json({ error: 'Token missing' });
  if (!start || !end) return res.status(400).json({ error: 'Start and end dates required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

    const query = `
      SELECT c.*, u.first_name, u.last_name 
      FROM collections c
      JOIN users u ON c.user_id = u.id
      WHERE u.bank_id = ? AND DATE(c.collected_at) BETWEEN ? AND ?
      ORDER BY c.collected_at DESC
    `;

    db.query(query, [bankId, start, end], (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      const total = results.reduce((sum, item) => sum + parseFloat(item.amount), 0);

      res.status(200).json({
        data: results,
        total,
      });
    });
  } catch (err) {
    console.error('Token error:', err);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

