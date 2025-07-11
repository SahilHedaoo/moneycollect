const express = require('express');
const router = express.Router();
const { addCollection, getCollectionsByUser,getTotalAmountByUser,getFilteredCollections,getUser, getCollections, getCollectionsByDateRange, getTopUsers } = require('../controllers/collectionController');
const { getSummaryByBank } = require('../controllers/collectionController');

router.post('/', addCollection); 
router.get('/user/:user_id', getCollectionsByUser); 
router.get('/total/user/:user_id', getTotalAmountByUser);
router.get('/user/:user_id/filter', getCollectionsByUser);
router.get('/summary', getSummaryByBank);
router.get('/user', getUser);
router.get('/get', getCollections);
router.get('/by-date', getCollectionsByDateRange);
router.get('/top-users', getTopUsers);

module.exports = router;