const express = require('express');
const router = express.Router();
const { registerBank, loginBank } = require('../controllers/bankController');
const { getProfile } = require('../controllers/bankController');

router.get('/profile', getProfile); // GET /api/banks/profile

router.post('/register', registerBank);
router.post('/login', loginBank);

module.exports = router;
