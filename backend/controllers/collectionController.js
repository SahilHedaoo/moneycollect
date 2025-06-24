const db = require('../models/db');

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

exports.getCollectionsByUser = (req, res) => {
  const { user_id } = req.params;

  db.query(
    'SELECT * FROM collections WHERE user_id = ? ORDER BY collected_at DESC',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json(results);
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
      res.status(200).json(results[0]); // returns { total: xxx.xx }
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
};





