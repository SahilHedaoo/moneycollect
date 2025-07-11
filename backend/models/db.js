const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.getConnection((err) => {
  if (err) {
    console.log('DB Connection Failed:', err);
  } else {
    console.log('DB Connected');
  }
});

module.exports = db;
