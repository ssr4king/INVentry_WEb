const express = require('express');
const router = express.Router();
const { createSale, getMySales, getAllSales } = require('../controllers/salesController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSale)
    .get(protect, admin, getAllSales);

router.get('/my-sales', protect, getMySales);

module.exports = router;
