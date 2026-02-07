const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                priceAtSale: { type: Number, required: true },
                purchasePriceAtSale: { type: Number, required: true }, // Store this for profit reports
            },
        ],
        taxAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        totalProfit: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
