
const express = require('express');
const router = express.Router();

const {
    getSales,
    createSale,
    recordPayment
} = require('../controllers/saleController');

// Get all sales
router.get('/', getSales);

// Record a new sale
router.post('/', createSale);

// Record an additional payment
router.patch('/:id/payment', recordPayment);

module.exports = router;
