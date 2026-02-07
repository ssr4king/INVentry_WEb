const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // Parallel execution for performance
    const [
        totalProducts,
        lowStockProducts,
        totalSalesCount,
        salesStats
    ] = await Promise.all([
        Product.countDocuments({}),
        Product.countDocuments({ $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } }),
        Sale.countDocuments({}),
        Sale.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalProfit: { $sum: '$totalProfit' },
                },
            },
        ]),
    ]);

    const stats = {
        totalProducts,
        lowStockCount: lowStockProducts,
        totalOrders: totalSalesCount,
        totalRevenue: salesStats[0]?.totalRevenue || 0,
        totalProfit: salesStats[0]?.totalProfit || 0,
    };

    res.json(stats);
});

// @desc    Get daily sales report (Bar Chart Data)
// @route   GET /api/reports/daily
// @access  Private/Admin
const getDailySales = asyncHandler(async (req, res) => {
    const dailySales = await Sale.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalAmount' },
                profit: { $sum: '$totalProfit' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } }, // Sort by date ascending for charts
        { $limit: 7 } // Last 7 days
    ]);

    res.json(dailySales);
});

// @desc    Get monthly sales report (Line Chart Data)
// @route   GET /api/reports/monthly
// @access  Private/Admin
const getMonthlySales = asyncHandler(async (req, res) => {
    const monthlySales = await Sale.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                revenue: { $sum: '$totalAmount' },
                profit: { $sum: '$totalProfit' },
            },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 } // Last 12 months
    ]);
    res.json(monthlySales);
});

// @desc    Get sales by category (Pie Chart Data)
// Note: Since we didn't add category to product schema initially, we will group by Product Name (Top 5) for now as a proxy.
// @route   GET /api/reports/category
// @access  Private/Admin
const getCategorySales = asyncHandler(async (req, res) => {
    // Unwind items to count individual product sales
    const categorySales = await Sale.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.name',
                value: { $sum: '$items.quantity' }, // Total quantity sold
                revenue: { $sum: { $multiply: ['$items.priceAtSale', '$items.quantity'] } }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 5 } // Top 5 Products
    ]);
    res.json(categorySales);
});

// @desc    Get Low Stock Items
// @route   GET /api/reports/low-stock
// @access  Private/Admin
const getLowStock = asyncHandler(async (req, res) => {
    // Find products where stockQuantity <= lowStockThreshold
    const lowStockItems = await Product.find({
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    });
    res.json(lowStockItems);
});

// @desc    Get Employee Stats (My Sales)
// @route   GET /api/reports/employee-stats
// @access  Private (Employee)
const getEmployeeStats = asyncHandler(async (req, res) => {
    // Get stats specifically for the logged in user
    const stats = await Sale.aggregate([
        { $match: { employee: req.user._id } },
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                todayRevenue: {
                    $sum: {
                        $cond: [
                            { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                            '$totalAmount',
                            0
                        ]
                    }
                },
                todaySalesCount: {
                    $sum: {
                        $cond: [
                            { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const result = stats[0] || { totalSales: 0, totalRevenue: 0, todayRevenue: 0, todaySalesCount: 0 };
    res.json(result);
});

module.exports = {
    getDashboardStats,
    getDailySales,
    getMonthlySales,
    getCategorySales,
    getLowStock,
    getEmployeeStats
};
