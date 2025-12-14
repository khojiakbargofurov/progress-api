const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/stats', dashboardController.getStats);
router.get('/search', searchController.search);

module.exports = router;
