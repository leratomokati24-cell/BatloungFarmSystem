
const saleModel = require('../models/saleModel');

// Get all sales
async function getSales(req, res) {
    try {
        const sales = await saleModel.getAllSales();

        res.status(200).json(sales);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to get sales',
            error: error.message
        });
    }
}

// Record a new sale
async function createSale(req, res) {
    try {
        const { vendor_id, items, payment_method, amount_paid } = req.body;

        if (
            !Number.isInteger(Number(vendor_id)) ||
            Number(vendor_id) <= 0 ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message: 'A valid vendor ID and at least one sale item are required'
            });
        }

        const validSizes = ['Small', 'Medium', 'Large'];
        const validMethods = ['CASH', 'MOBILE_MONEY', 'CREDIT'];

        const selectedMethod = payment_method || 'CREDIT';
        const paid = amount_paid === undefined ? 0 : Number(amount_paid);

        if (!validMethods.includes(selectedMethod)) {
            return res.status(400).json({
                message: 'Payment method must be CASH, MOBILE_MONEY or CREDIT'
            });
        }

        if (!Number.isFinite(paid) || paid < 0) {
            return res.status(400).json({
                message: 'Amount paid must be a valid non-negative amount'
            });
        }

        for (const item of items) {
            if (
                !Number.isInteger(Number(item.fruit_id)) ||
                Number(item.fruit_id) <= 0 ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0 ||
                item.unit_price === undefined ||
                item.unit_price === null ||
                !Number.isFinite(Number(item.unit_price)) ||
                Number(item.unit_price) < 0 ||
                !validSizes.includes(item.packaging_size)
            ) {
                return res.status(400).json({
                    message: 'Each item needs a valid fruit ID, positive quantity, non-negative unit price and valid packaging size'
                });
            }
        }

        const cleanItems = items.map(item => ({
            fruit_id: Number(item.fruit_id),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            packaging_size: item.packaging_size
        }));

        const result = await saleModel.createSale(
            Number(vendor_id),
            cleanItems,
            selectedMethod,
            paid
        );

        res.status(201).json({
            message: 'Sale recorded successfully',
            ...result
        });

    } catch (error) {
        const statusCode =
            error.message.startsWith('Insufficient stock') ||
            error.message.startsWith('No stock record') ||
            error.message.includes('Amount paid')
                ? 400
                : error.code === 'ER_NO_REFERENCED_ROW_2'
                    ? 400
                    : 500;

        res.status(statusCode).json({
            message: 'Failed to record sale',
            error: error.message
        });
    }
}

// Add payment to an existing sale
async function recordPayment(req, res) {
    try {
        const sale_id = Number(req.params.id);
        const { payment_amount, payment_method } = req.body;

        const validMethods = ['CASH', 'MOBILE_MONEY', 'CREDIT'];

        if (!Number.isInteger(sale_id) || sale_id <= 0) {
            return res.status(400).json({
                message: 'Invalid sale ID'
            });
        }

        if (
            payment_amount === undefined ||
            !Number.isFinite(Number(payment_amount)) ||
            Number(payment_amount) <= 0
        ) {
            return res.status(400).json({
                message: 'Enter a valid payment amount greater than zero'
            });
        }

        if (!validMethods.includes(payment_method)) {
            return res.status(400).json({
                message: 'Payment method must be CASH, MOBILE_MONEY or CREDIT'
            });
        }

        const result = await saleModel.addPayment(
            sale_id,
            Number(payment_amount),
            payment_method
        );

        res.status(200).json({
            message: 'Payment recorded successfully',
            ...result
        });

    } catch (error) {
        const statusCode =
            error.message === 'Sale not found' ||
            error.message.includes('exceeds the outstanding balance')
                ? 400
                : 500;

        res.status(statusCode).json({
            message: 'Failed to record payment',
            error: error.message
        });
    }
}

module.exports = {
    getSales,
    createSale,
    recordPayment
};
