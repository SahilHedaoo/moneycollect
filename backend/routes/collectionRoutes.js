const express = require('express');
const router = express.Router();
const { addCollection, getCollectionsByUser,getTotalAmountByUser,getFilteredCollections,getUser, getCollections } = require('../controllers/collectionController');
const { getSummaryByBank } = require('../controllers/collectionController');

router.post('/', addCollection); // POST /api/collections
router.get('/user/:user_id', getCollectionsByUser); // GET /api/collections/user/5
router.get('/total/user/:user_id', getTotalAmountByUser);
router.get('/user/:user_id/filter', getCollectionsByUser);
router.get('/summary', getSummaryByBank);
router.get('/user', getUser);
router.get('/collections', getCollections);


module.exports = router;
