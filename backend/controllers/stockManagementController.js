const stockModel = require('../models/stockManagementModel');

// Get all stock
async function getAllStock(req, res) {
    try {
        const stock = await stockModel.getAllStock();

        res.status(200).json(stock);

    } catch (error) {
        console.error('Stock loading error:', error);

        res.status(500).json({
            message: 'Failed to retrieve stock information.'
        });
    }
}

module.exports = {
    getAllStock
};