const express = require('express');
const router = express.Router();
const { addCollection, getCollectionsByUser,getTotalAmountByUser } = require('../controllers/collectionController');
const { getFilteredCollections,} = require('../controllers/collectionController');
const { getSummaryByBank } = require('../controllers/collectionController');

router.post('/', addCollection); // POST /api/collections
router.get('/user/:user_id', getCollectionsByUser); // GET /api/collections/user/5
router.get('/total/user/:user_id', getTotalAmountByUser);
router.get('/user/:user_id/filter', getCollectionsByUser);
router.get('/summary', getSummaryByBank);

module.exports = router;
