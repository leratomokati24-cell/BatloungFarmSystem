
const stockModel = require('../models/stockModel');

// Get all stock
async function getStock(req, res) {
    try {
        const stock = await stockModel.getAllStock();

        res.status(200).json(stock);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to get stock',
            error: error.message
        });
    }
}

// Add stock
async function createStock(req, res) {
    try {
        const { fruit_id, packaging_size, quantity } = req.body;

        if (!fruit_id || !packaging_size || quantity === undefined) {
            return res.status(400).json({
                message: 'Fruit ID, packaging size and quantity are required'
            });
        }

        const validSizes = ['Small', 'Medium', 'Large'];

        if (!validSizes.includes(packaging_size)) {
            return res.status(400).json({
                message: 'Packaging size must be Small, Medium or Large'
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: 'Quantity must be a positive whole number'
            });
        }

        await stockModel.addStock(
            fruit_id,
            packaging_size,
            quantity
        );

        res.status(201).json({
            message: 'Stock added successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add stock',
            error: error.message
        });
    }
}

module.exports = {
    getStock,
    createStock
};
