
const express = require('express');
const router = express.Router();

const {
    getPurchases,
    createPurchase
} = require('../controllers/purchaseController');

// Get all purchases
router.get('/', getPurchases);

// Record a new purchase
router.post('/', createPurchase);

module.exports = router;
