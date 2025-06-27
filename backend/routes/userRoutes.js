const express = require('express');
const router = express.Router();
const { addUser, getUsers, deleteUser,updateUser } = require('../controllers/userController');

router.post('/', addUser);         // POST /api/users
router.get('/', getUsers);         // GET /api/users
router.delete('/:userId', deleteUser);
router.put('/:id', updateUser);

module.exports = router;
