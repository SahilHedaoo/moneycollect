const db = require('../models/db');
const jwt = require('jsonwebtoken');

// Helper: Get difference in days
function getDateDifferenceInDays(fromDate, toDate) {
  const diffTime = Math.abs(new Date(toDate) - new Date(fromDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Main Controller
exports.processReturn = async (req, res) => {
  const { userId } = req.params;
  const { from_date, to_date, rate, is_compound, compound_frequency } = req.body;

  if (!from_date || !to_date || !rate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const bankId = decoded.bankId;

    console.log("userId:", userId, "bankId:", bankId);

    // Check if user belongs to bank
    db.query(
      'SELECT * FROM users WHERE id = ? AND bank_id = ?',
      [userId, bankId],
      (err, userResult) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err.message });
        if (userResult.length === 0) return res.status(404).json({ error: 'User not found or unauthorized' });

        // Get total collected amount
        db.query(
          `SELECT SUM(amount) AS total FROM collections 
           WHERE user_id = ?  AND DATE(collected_at) BETWEEN ? AND ?`,
          [userId, from_date, to_date],
          (err, amountResult) => {
            if (err) return res.status(500).json({ error: 'Database error', details: err.message });

            const principal = amountResult[0].total || 0;
            const days = getDateDifferenceInDays(from_date, to_date);
            const rateDecimal = rate / 100;
            const t = days / 365;

            let n = 1; // default yearly
            switch ((compound_frequency || '').toLowerCase()) {
              case 'daily': n = 365; break;
              case 'monthly': n = 12; break;
              case 'quarterly': n = 4; break;
              case 'yearly': n = 1; break;
              default: n = 365; break;
            }

            let interest = 0;
            let amountReturned = 0;
            let method = 'simple';

            if (is_compound) {
              amountReturned = principal * Math.pow(1 + rateDecimal / n, n * t);
              interest = amountReturned - principal;
              method = `compound (${compound_frequency || 'daily'})`;
            } else {
              interest = (principal * rate * days) / (100 * 365);
              amountReturned = principal + interest;
            }

            res.status(200).json({
              principal: parseFloat(principal.toFixed(2)),
              interest: parseFloat(interest.toFixed(2)),
              amount_returned: parseFloat(amountReturned.toFixed(2)),
              days_invested: days,
              rate: parseFloat(rate),
              compounding: method
            });
          }
        );
      }
    );
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token', details: err.message });
  }
};
