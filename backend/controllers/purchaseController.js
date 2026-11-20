
const purchaseModel = require('../models/purchaseModel');

// Get all purchases
async function getPurchases(req, res) {
    try {
        const purchases = await purchaseModel.getAllPurchases();

        res.status(200).json(purchases);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to get purchases',
            error: error.message
        });
    }
}

// Create a purchase
async function createPurchase(req, res) {
    try {
        const { supplier_id, items } = req.body;

        // Check required information
        if (!supplier_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Supplier ID and at least one purchase item are required'
            });
        }

        // Validate each item
        const validSizes = ['Small', 'Medium', 'Large'];

        for (const item of items) {
            if (
                !Number.isInteger(Number(item.fruit_id)) ||
                Number(item.fruit_id) <= 0 ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0 ||
                item.unit_cost === undefined ||
                item.unit_cost === null ||
                !Number.isFinite(Number(item.unit_cost)) ||
                Number(item.unit_cost) < 0 ||
                !validSizes.includes(item.packaging_size)
            ) {
                return res.status(400).json({
                    message: 'Each item needs a valid fruit ID, positive whole quantity, non-negative unit cost and valid packaging size'
                });
            }
        }

        const result = await purchaseModel.createPurchase(
            Number(supplier_id),
            items.map(item => ({
                fruit_id: Number(item.fruit_id),
                quantity: Number(item.quantity),
                unit_cost: Number(item.unit_cost),
                packaging_size: item.packaging_size
            }))
        );

        res.status(201).json({
            message: 'Purchase recorded successfully',
            purchase_id: result.purchase_id,
            total_amount: result.total_amount
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to record purchase',
            error: error.message
        });
    }
}

module.exports = {
    getPurchases,
    createPurchase
};
