const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private (Admin & Employee)
const createSale = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items in sale');
    }

    let totalAmount = 0;
    let totalProfit = 0;
    const processedItems = [];

    // 1. Validate Stock and Calculate Totals
    // We do this serially to ensure we can stop if any item is invalid
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.product}`);
        }

        if (product.stockQuantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
        }

        const priceAtSale = product.sellingPrice;
        const purchasePriceAtSale = product.purchasePrice;
        const profitPerItem = (priceAtSale - purchasePriceAtSale) * item.quantity;
        const itemTotal = priceAtSale * item.quantity;

        totalAmount += itemTotal;
        totalProfit += profitPerItem;

        processedItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            priceAtSale,
            purchasePriceAtSale,
        });
    }

    // 2. Reduce Stock
    // Since we verified everything, we now commit the changes.
    // Ideally, use a transaction here if using a Replica Set.
    // For standalone, we proceed with loop updates.
    for (const item of processedItems) {
        const product = await Product.findById(item.product);
        product.stockQuantity -= item.quantity;
        await product.save();
    }

    // 3. Create Sale Record
    // Re-calculate tax to ensure data integrity or trust incoming if simple
    // Here we trust the totalAmount passed (which implies tax is included) but we also want to store tax separately
    // Let's rely on the frontend to pass `taxAmount` and we verify simple math

    let taxAmount = req.body.taxAmount || 0;

    // If taxAmount wasn't passed, we assume totalAmount includes it or it is 0. 
    // Ideally we should recalculate: totalAmount = itemSum + taxAmount

    const finalTotal = totalAmount + taxAmount;

    const sale = new Sale({
        employee: req.user._id,
        items: processedItems,
        taxAmount,
        totalAmount: finalTotal, // Use the computed total (ItemSum + Tax)
        totalProfit,
    });

    const createdSale = await sale.save();

    res.status(201).json(createdSale);
});

// @desc    Get logged in user sales
// @route   GET /api/sales/my-sales
// @access  Private
const getMySales = asyncHandler(async (req, res) => {
    const sales = await Sale.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(sales);
});

// @desc    Get all sales (Admin only)
// @route   GET /api/sales
// @access  Private/Admin
const getAllSales = asyncHandler(async (req, res) => {
    // Populate employee name
    const sales = await Sale.find({}).populate('employee', 'name email').sort({ createdAt: -1 });
    res.json(sales);
});

module.exports = { createSale, getMySales, getAllSales };
