const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        sku: {
            type: String,
            required: false, // Optional stock keeping unit
        },
        purchasePrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        sellingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        stockQuantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0, // Stock cannot be negative
        },
        lowStockThreshold: {
            type: Number,
            required: true,
            default: 5,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
