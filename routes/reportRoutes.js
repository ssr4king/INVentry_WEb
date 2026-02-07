const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getDailySales,
    getLowStock,
    getMonthlySales,
    getCategorySales,
    getEmployeeStats
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/daily', protect, admin, getDailySales);
router.get('/monthly', protect, admin, getMonthlySales); // New
router.get('/category', protect, admin, getCategorySales);
router.get('/low-stock', protect, admin, getLowStock);
router.get('/employee-stats', protect, getEmployeeStats); // No 'admin' middleware

module.exports = router;
